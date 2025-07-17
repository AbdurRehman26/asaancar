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
        return Car::with(['carBrand', 'carType', 'carEngine', 'store', 'carOffers' => function($query) {
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
        
        return $cars->map(function ($car) {
            return $this->formatCarForListing($car);
        })->toArray();
    }

    /**
     * Get a single car with formatted data
     */
    public function getCarForListing(int $carId): ?array
    {
        $car = Car::with(['carBrand', 'carType', 'carEngine', 'store', 'carOffers' => function($query) {
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
            'model' => $car->model,
            'year' => $car->year,
            'image' => $this->getPrimaryImage($car),
            'images' => $car->image_urls ?? [],
            'price' => $pricing,
            'features' => $this->extractFeatures($car),
            'specifications' => [
                'seats' => $car->seats ?? 5,
                'fuelType' => $car->fuel_type ?? 'Gasoline',
                'transmission' => $car->transmission ?? 'Automatic',
                'mileage' => $this->getMileage($car),
                'color' => $car->color ?? 'Not specified',
                'engine' => $car->carEngine->name ?? 'Not specified',
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
        return $car->carOffers->sortByDesc('discount_percentage')->first();
    }

    /**
     * Calculate pricing with offers applied
     */
    private function calculatePricing(Car $car, ?CarOffer $offer = null): array
    {
        // Use actual prices from car offer if available, otherwise use defaults
        if ($offer) {
            $withoutDriver = $offer->price_without_driver ?? 150.00;
            $withDriver = $offer->price_with_driver ?? 200.00;
        } else {
            // Default pricing if no offer
            $withoutDriver = 150.00;
            $withDriver = 200.00;
        }

        return [
            'perDay' => [
                'withoutDriver' => round($withoutDriver, 2),
                'withDriver' => round($withDriver, 2),
            ]
        ];
    }

    /**
     * Get primary image for car
     */
    private function getPrimaryImage(Car $car): ?string
    {
        if (empty($car->image_urls)) {
            return null;
        }

        return is_array($car->image_urls) ? $car->image_urls[0] : $car->image_urls;
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

        if ($car->carEngine && $car->carEngine->name) {
            $features[] = $car->carEngine->name;
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
    private function formatStoreData($store): array
    {
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
            'title' => $offer->title,
            'description' => $offer->description,
            'discount' => $offer->discount_percentage,
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
        $query = Car::with(['carBrand', 'carType', 'carEngine', 'store', 'carOffers' => function($query) {
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

        if (!empty($filters['max_price'])) {
            // This would need to be implemented based on your pricing structure
            // $query->where('base_price', '<=', $filters['max_price']);
        }

        $cars = $query->get();

        return $cars->map(function ($car) {
            return $this->formatCarForListing($car);
        })->toArray();
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
        return \App\Models\CarType::select('id', 'name')->get()->toArray();
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
    public function getPaginatedCarsForListing($perPage = 9, $filters = [])
    {
        $query = Car::with(['carBrand', 'carType', 'carEngine', 'store', 'carOffers' => function($query) {
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
        if (!empty($filters['max_price'])) {
            // Implement price filtering if needed
        }

        $cars = $query->paginate($perPage);

        $formatted = $cars->getCollection()->map(function ($car) {
            return $this->formatCarForListing($car);
        });

        return [
            'data' => $formatted,
            'current_page' => $cars->currentPage(),
            'last_page' => $cars->lastPage(),
            'total' => $cars->total(),
            'per_page' => $cars->perPage(),
        ];
    }
} 