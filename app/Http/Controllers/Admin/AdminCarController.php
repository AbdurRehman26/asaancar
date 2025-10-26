<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Services\AdminCarService;
use Illuminate\Http\Request;
use App\Http\Resources\CarResource;

class AdminCarController extends Controller
{
    protected $adminCarService;

    public function __construct(AdminCarService $adminCarService)
    {
        $this->adminCarService = $adminCarService;
    }

    /**
     * Get all cars for admin (no store filtering)
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 9);
        $filters = $request->only([
            'brand_id', 'type_id', 'store_id', 'transmission',
            'fuel_type', 'min_seats', 'max_price'
        ]);

        // Admin can see all cars, so we don't filter by user's stores
        $paginated = $this->adminCarService->getPaginatedCarsForAdmin($perPage, $filters, auth()->user());
        return response()->json($paginated);
    }

    /**
     * Get car details for admin
     */
    public function show($id)
    {
        $car = Car::with(['carBrand', 'carType', 'store', 'carOffers'])->find((int) $id);
        if (!$car) {
            return response()->json(['message' => 'Car not found'], 404);
        }
        return new CarResource($car);
    }

    /**
     * Get car statistics for admin
     */
    public function stats(Request $request)
    {
        $storeId = $request->get('store_id');
        
        $query = Car::query();
        
        if ($storeId) {
            $query->where('store_id', $storeId);
        }
        
        $totalCars = $query->count();
        $activeCars = $query->clone()->whereHas('store')->count();
        $inactiveCars = $query->clone()->whereDoesntHave('store')->count();

        return response()->json([
            'total_cars' => $totalCars,
            'active_cars' => $activeCars,
            'inactive_cars' => $inactiveCars,
        ]);
    }

    /**
     * Get filters for admin (all brands, types, stores)
     */
    public function getFilters()
    {
        $brands = $this->adminCarService->getCarBrands();
        $types = $this->adminCarService->getCarTypes();
        $stores = $this->adminCarService->getAllStores(); // Admin can see all stores

        return response()->json([
            'success' => true,
            'data' => [
                'brands' => $brands,
                'types' => $types,
                'stores' => $stores,
            ]
        ]);
    }
}
