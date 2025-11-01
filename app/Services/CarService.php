<?php

namespace App\Services;

use App\Models\Car;
use App\Models\CarOffer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

class CarService
{
    /**
     * Get all available cars with their related data and pricing
     */
    public function getAvailableCars(): Collection
    {
        return Car::with(['carBrand', 'carModel', 'carType', 'store', 'carOffers' => function($query) {
            $query->where('is_active', true)
                  ->where(function($q) {
                      $q->where(function($subQ) {
                          $subQ->whereNotNull('start_date')
                               ->whereNotNull('end_date')
                               ->where('start_date', '<=', now())
                               ->where('end_date', '>=', now());
                      })->orWhere(function($subQ) {
                          $subQ->whereNull('start_date')
                               ->whereNull('end_date');
                      });
                  });
        }])
        ->whereHas('store')
        ->get();
    }

    /**
     * Get cars with formatted data for API responses
     */
    public function getCarsForListing(): array
    {
        $cars = $this->getAvailableCars();

        return $cars->filter(function ($car) {
            return $this->hasWithoutDriverPricing($car);
        })->map(function ($car) {
            return $this->formatCarForListing($car);
        })->toArray();
    }

    /**
     * Get a single car with formatted data
     */
    public function getCarForListing(int $carId): ?array
    {
        $car = Car::with(['carBrand', 'carModel', 'carType', 'store', 'carOffers' => function($query) {
            $query->where('is_active', true)
                  ->where(function($q) {
                      $q->where(function($subQ) {
                          $subQ->whereNotNull('start_date')
                               ->whereNotNull('end_date')
                               ->where('start_date', '<=', now())
                               ->where('end_date', '>=', now());
                      })->orWhere(function($subQ) {
                          $subQ->whereNull('start_date')
                               ->whereNull('end_date');
                      });
                  });
        }])
        ->whereHas('store')
        ->find($carId);

        if (!$car) {
            return null;
        }

        return $this->formatCarForListing($car);
    }

    /**
     * Format car data for listing display
     */
    private function formatCarForListing(Car $car): array
    {
        $bestOffer = $this->getBestActiveOffer($car);
        $pricing = $this->calculatePricing($car, $bestOffer);

        return [
            'id' => $car->id,
            'name' => $car->name ?? $car->carBrand->name . ' ' . $car->model,
            'brand' => $car->carBrand->name ?? 'Unknown',
            'type' => $car->carType->name ?? null,
            'car_brand_id' => $car->car_brand_id,
            'car_model_id' => $car->car_model_id,
            'car_type_id' => $car->car_type_id,
            'store_id' => $car->store_id,
            'model' => $car->model,
            'year' => $car->year,
            'color' => $car->color,
            'seats' => $car->seats,
            'transmission' => $car->transmission,
            'fuel_type' => $car->fuel_type,
            'image' => $this->getPrimaryImage($car),
            'images' => $car->image_urls ?? [],
            'carModel' => $car->carModel ? [
                'id' => $car->carModel->id,
                'name' => $car->carModel->name,
                'slug' => $car->carModel->slug,
                'image' => $car->carModel->image,
            ] : null,
            'price' => $pricing,
            // Frontend pricing fields for booking summary
            'withoutDriver' => $pricing['perDay']['withoutDriver'],
            'withDriver' => $pricing['perDay']['withDriver'],
            'fuel' => 2.50, // Default fuel rate per km
            'overtime' => 25.00, // Default overtime rate per hour
            'currency' => $pricing['currency'],
            'features' => $this->extractFeatures($car),
            'specifications' => [
                'seats' => $car->seats ?? 5,
                'fuelType' => $car->fuel_type ?? 'Gasoline',
                'transmission' => $car->transmission ?? 'Automatic',
                'mileage' => $this->getMileage($car),
                'color' => $car->color ?? 'Not specified',
                'engine' => 'Not specified',
                'type' => $car->carType->name ?? 'Not specified',
            ],
            'store' => $this->formatStoreData($car->store),
            'available' => $this->checkAvailability($car),
            'offer' => $bestOffer ? $this->formatOfferData($bestOffer) : null,
            'description' => $car->description,
            'created_at' => $car->created_at,
            'updated_at' => $car->updated_at,
        ];
    }

    /**
     * Get the best active offer for a car
     */
    private function getBestActiveOffer(Car $car): ?CarOffer
    {
        // First try to find an offer with actual pricing (without driver or with driver)
        $offerWithPricing = $car->carOffers->filter(function ($offer) {
            return $offer->price_without_driver !== null || $offer->price_with_driver !== null;
        })->sortByDesc('discount_percentage')->first();
        
        // If no offer with pricing found, return the offer with highest discount
        return $offerWithPricing ?: $car->carOffers->sortByDesc('discount_percentage')->first();
    }

    /**
     * Check if car has "without driver" pricing
     */
    private function hasWithoutDriverPricing(Car $car): bool
    {
        $bestOffer = $this->getBestActiveOffer($car);
        return $bestOffer && $bestOffer->price_without_driver !== null;
    }

    /**
     * Calculate pricing with offers applied
     */
    private function calculatePricing(Car $car, ?CarOffer $offer = null): array
    {
        // Use actual prices from car offer if available, otherwise use defaults
        if ($offer) {
            $withoutDriver = $offer->price_without_driver;
            $withDriver = $offer->price_with_driver;
            $currency = $offer->currency ?? 'PKR';
        } else {
            // Default pricing if no offer
            $withoutDriver = null;
            $withDriver = null;
            $currency = 'PKR';
        }

        return [
            'perDay' => [
                'withoutDriver' => $withoutDriver ? round($withoutDriver, 2) : null,
                'withDriver' => $withDriver ? round($withDriver, 2) : null,
            ],
            'currency' => $currency
        ];
    }

    /**
     * Get primary image for car
     */
    private function getPrimaryImage(Car $car): ?string
    {
        // First try to get car image
        if (!empty($car->image_urls)) {
            if (is_array($car->image_urls)) {
                if (isset($car->image_urls[0]) && is_string($car->image_urls[0])) {
                    return (string)$car->image_urls[0];
                }
            }
            if (is_string($car->image_urls)) {
                return $car->image_urls;
            }
        }

        // Second priority: Car model image
        if ($car->carModel && $car->carModel->image) {
            return $car->carModel->image;
        }

        // Third priority: Brand image
        if ($car->carBrand && $car->carBrand->name) {
            $brandName = strtolower($car->carBrand->name);
            return "/images/car-brands/{$brandName}.png";
        }

        // Final fallback: placeholder
        return '/images/car-placeholder.jpeg';
    }

    /**
     * Extract features from car data
     */
    private function extractFeatures(Car $car): array
    {
        $features = [];

        if ($car->transmission) {
            $features[] = ucfirst($car->transmission);
        }

        if ($car->fuel_type) {
            $features[] = ucfirst($car->fuel_type);
        }

        if ($car->seats) {
            $features[] = $car->seats . ' Seats';
        }

        if ($car->carType && $car->carType->name) {
            $features[] = $car->carType->name;
        }



        // Add common features based on car type or other criteria
        $features[] = 'Air Conditioning';
        $features[] = 'Bluetooth';

        return array_filter($features);
    }

    /**
     * Get mileage information
     */
    private function getMileage(Car $car): string
    {
        // You can add a mileage field to your car model
        return '15,000 km'; // Default for now
    }

    /**
     * Format store data
     */
    private function formatStoreData($store): ?array
    {
        if (!$store) {
            return null;
        }
        
        return [
            'id' => $store->id,
            'name' => $store->name ?? 'Unknown Store',
            'address' => $store->address ?? 'Address not available',
            'phone' => $store->contact_phone ?? 'Phone not available',
            'email' => $store->email ?? null,
            'rating' => 4.5, // You can add this to your store model
            'reviews' => 50, // You can add this to your store model
            'description' => $store->description ?? null,
            'logo_url' => $store->logo_url ?? null,
        ];
    }

    /**
     * Check if car is available for booking
     */
    private function checkAvailability(Car $car): bool
    {
        // You can implement availability logic based on existing bookings
        // For now, return true if car exists and has a store
        return !empty($car->store_id);
    }

    /**
     * Format offer data
     */
    private function formatOfferData(CarOffer $offer): array
    {
        return [
            'id' => $offer->id,
            'discount' => $offer->discount_percentage,
            'currency' => $offer->currency ?? 'PKR',
            'start_date' => $offer->start_date,
            'end_date' => $offer->end_date,
            'is_active' => $offer->is_active,
        ];
    }

    /**
     * Search cars with filters
     */
    public function searchCars(array $filters = []): array
    {
        $query = Car::with(['carBrand', 'carModel', 'carType', 'store', 'carOffers' => function($query) {
            $query->where('is_active', true)
                  ->where('start_date', '<=', now())
                  ->where('end_date', '>=', now());
        }])
        ->whereHas('store');

        // Apply filters
        if (!empty($filters['brand_id'])) {
            $query->where('car_brand_id', $filters['brand_id']);
        }

        if (!empty($filters['type_id'])) {
            $query->where('car_type_id', $filters['type_id']);
        }

        if (!empty($filters['store_id'])) {
            $query->where('store_id', $filters['store_id']);
        }

        if (!empty($filters['transmission'])) {
            $query->where('transmission', $filters['transmission']);
        }

        if (!empty($filters['fuel_type'])) {
            $query->where('fuel_type', $filters['fuel_type']);
        }

        if (!empty($filters['min_seats'])) {
            $query->where('seats', '>=', $filters['min_seats']);
        }

        // Filter by tags
        if (!empty($filters['tag_ids']) && is_array($filters['tag_ids'])) {
            $query->whereHas('tags', function($q) use ($filters) {
                $q->whereIn('tags.id', $filters['tag_ids']);
            });
        }

        $cars = $query->get();

        $formatted = $cars->map(function ($car) {
            return $this->formatCarForListing($car);
        });

        // Apply max price filter after formatting (since prices are calculated dynamically)
        if (!empty($filters['max_price'])) {
            $maxPrice = (float) $filters['max_price'];
            $formatted = $formatted->filter(function ($car) use ($maxPrice) {
                // Use withDriver price if available, otherwise withoutDriver price
                $price = $car['price']['perDay']['withDriver'] ?? $car['price']['perDay']['withoutDriver'] ?? 0;
                return $price <= $maxPrice;
            });
        }

        return $formatted->values()->toArray();
    }

    /**
     * Get car brands for filtering
     */
    public function getCarBrands(): array
    {
        return \App\Models\CarBrand::select('id', 'name')->get()->toArray();
    }

    /**
     * Get car types for filtering
     */
    public function getCarTypes(): array
    {
        return \App\Models\CarType::select('id', 'name', 'image')->get()->toArray();
    }

    /**
     * Get stores for filtering
     */
    public function getStores(): array
    {
        return \App\Models\Store::select('id', 'name', 'address')->get()->toArray();
    }



    /**
     * Get paginated cars for API listing
     */
    public function getPaginatedCarsForListing($perPage = 9, $filters = [], $user = null)
    {
        $query = Car::with(['carBrand', 'carModel', 'carType', 'store', 'carOffers' => function($query) {
            $query->where('is_active', true)
                  ->where(function($q) {
                      $q->where(function($subQ) {
                          $subQ->whereNotNull('start_date')
                               ->whereNotNull('end_date')
                               ->where('start_date', '<=', now())
                               ->where('end_date', '>=', now());
                      })->orWhere(function($subQ) {
                          $subQ->whereNull('start_date')
                               ->whereNull('end_date');
                      });
                  });
        }])
        ->whereHas('store');

        // If no specific store_id is provided and user is authenticated, filter by user's stores
        // Admin users can see all cars, regular users only see cars from their stores
        if (empty($filters['store_id']) && $user && !$user->hasRole('admin')) {
            $userStoreIds = $user->stores()->pluck('stores.id')->toArray();
            if (!empty($userStoreIds)) {
                $query->whereIn('store_id', $userStoreIds);
            } else {
                // If user has no stores, return empty result
                $query->where('id', 0);
            }
        }

        // Apply filters
        if (!empty($filters['brand_id'])) {
            $query->where('car_brand_id', $filters['brand_id']);
        }
        if (!empty($filters['type_id'])) {
            $query->where('car_type_id', $filters['type_id']);
        }
        if (!empty($filters['store_id'])) {
            $query->where('store_id', $filters['store_id']);
        }
        if (!empty($filters['transmission'])) {
            $query->where('transmission', $filters['transmission']);
        }
        if (!empty($filters['fuel_type'])) {
            $query->where('fuel_type', $filters['fuel_type']);
        }
        if (!empty($filters['min_seats'])) {
            $query->where('seats', '>=', $filters['min_seats']);
        }

        // Filter by tags
        if (!empty($filters['tag_ids']) && is_array($filters['tag_ids'])) {
            $query->whereHas('tags', function($q) use ($filters) {
                $q->whereIn('tags.id', $filters['tag_ids']);
            });
        }

        $query->orderBy('cars.priority', 'desc')->orderBy('cars.created_at', 'desc');

        $cars = $query->paginate($perPage);

        $formatted = $cars->getCollection()->map(function ($car) {
            return $this->formatCarForListing($car);
        });

        // Apply max price filter after formatting (since prices are calculated dynamically)
        if (!empty($filters['max_price'])) {
            $maxPrice = (float) $filters['max_price'];
            $formatted = $formatted->filter(function ($car) use ($maxPrice) {
                // Use withDriver price if available, otherwise withoutDriver price
                $price = $car['price']['perDay']['withDriver'] ?? $car['price']['perDay']['withoutDriver'] ?? 0;
                return $price <= $maxPrice;
            });
        }

        return [
            'data' => $formatted->values(),
            'current_page' => $cars->currentPage(),
            'last_page' => $cars->lastPage(),
            'total' => $formatted->count(),
            'per_page' => $cars->perPage(),
        ];
    }


}
