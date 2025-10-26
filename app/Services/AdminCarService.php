<?php

namespace App\Services;

use App\Models\Car;
use App\Models\CarBrand;
use App\Models\CarType;
use App\Models\Store;

class AdminCarService
{
    /**
     * Get paginated cars for admin listing (no user store filtering)
     */
    public function getPaginatedCarsForAdmin($perPage = 9, $filters = [], $user = null)
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

       // Apply filters (admin can see all cars, no user store filtering)
        if (!empty($filters['brand_id'])) {
            $query->where('car_brand_id', $filters['brand_id']);
        }
        if (!empty($filters['type_id'])) {
            $query->where('car_type_id', $filters['type_id']);
        }
        if (!empty($filters['store_id'])) {
            $query->where('store_id', $filters['store_id']);
        }else{

            $userStoreIds = $user->stores()->pluck('stores.id')->toArray();
            // If user has no stores, they should see no cars
            if (empty($userStoreIds)) {

            } else {
                $query->whereIn('store_id', $userStoreIds);
            }

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

        $query->orderBy('cars.priority', 'desc')->orderBy('cars.created_at', 'desc');

        $cars = $query->paginate($perPage);

        $formatted = $cars->getCollection()->map(function ($car) {
            return $this->formatCarForListing($car);
        });

        // Apply max price filter after formatting (since prices are calculated dynamically)
        if (!empty($filters['max_price'])) {
            $maxPrice = (float) $filters['max_price'];
            $formatted = $formatted->filter(function ($car) use ($maxPrice) {
                $price = $car['price']['perDay']['withoutDriver'] ?? 0;
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

    /**
     * Get car brands for filtering
     */
    public function getCarBrands(): array
    {
        return CarBrand::select('id', 'name')->get()->toArray();
    }

    /**
     * Get car types for filtering
     */
    public function getCarTypes(): array
    {
        return CarType::select('id', 'name', 'image')->get()->toArray();
    }

    /**
     * Get all stores for admin (no filtering)
     */
    public function getAllStores(): array
    {
        return Store::select('id', 'name', 'address')->get()->toArray();
    }

    /**
     * Format car for listing (admin version - same as customer but can be customized)
     */
    protected function formatCarForListing($car)
    {
        $pricing = $this->getCarPricing($car);

        return [
            'id' => $car->id,
            'name' => $car->name ?? $car->carBrand->name . ' ' . $car->model,
            'car_model' => $car->carModel,
            'brand' => $car->carBrand->name ?? 'Unknown',
            'type' => $car->carType->name ?? null,
            'car_brand_id' => $car->car_brand_id,
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
            'price' => $pricing,
            'store' => [
                'id' => $car->store->id,
                'name' => $car->store->name,
                'address' => $car->store->address,
            ],
            'specifications' => [
                'brand' => $car->carBrand->name ?? 'Unknown',
                'type' => $car->carType->name ?? 'Not specified',
                'model' => $car->model,
                'year' => $car->year,
                'color' => $car->color,
                'seats' => $car->seats,
                'transmission' => $car->transmission,
                'fuelType' => $car->fuel_type,
                'engine' => 'Not specified',
            ],
            'features' => $this->getCarFeatures($car),
            'created_at' => $car->created_at,
            'updated_at' => $car->updated_at,
        ];
    }

    /**
     * Get car pricing information
     */
    protected function getCarPricing($car)
    {
        $activeOffer = $car->carOffers->first();

        if (!$activeOffer) {
            return [
                'perDay' => [
                    'withoutDriver' => 0,
                    'withDriver' => 0,
                ],
                'perWeek' => [
                    'withoutDriver' => 0,
                    'withDriver' => 0,
                ],
                'perMonth' => [
                    'withoutDriver' => 0,
                    'withDriver' => 0,
                ],
            ];
        }

        $withoutDriver = $activeOffer->price_without_driver ?? 0;
        $withDriver = $activeOffer->price_with_driver ?? 0;

        return [
            'perDay' => [
                'withoutDriver' => $withoutDriver,
                'withDriver' => $withDriver,
            ],
            'perWeek' => [
                'withoutDriver' => $withoutDriver * 7,
                'withDriver' => $withDriver * 7,
            ],
            'perMonth' => [
                'withoutDriver' => $withoutDriver * 30,
                'withDriver' => $withDriver * 30,
            ],
        ];
    }

    /**
     * Get primary image for car
     */
    protected function getPrimaryImage($car)
    {
        if ($car->image_urls && is_array($car->image_urls) && count($car->image_urls) > 0) {
            return $car->image_urls[0];
        }
        return '';
    }

    /**
     * Get car features
     */
    protected function getCarFeatures($car)
    {
        $features = [];

        if ($car->seats) {
            $features[] = $car->seats . ' Seats';
        }
        if ($car->transmission) {
            $features[] = ucfirst($car->transmission) . ' Transmission';
        }
        if ($car->fuel_type) {
            $features[] = ucfirst($car->fuel_type);
        }
        if ($car->carType) {
            $features[] = ucfirst($car->carType->name);
        }

        return $features;
    }
}
