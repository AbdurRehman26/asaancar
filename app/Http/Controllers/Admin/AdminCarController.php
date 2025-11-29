<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Services\AdminCarService;
use Illuminate\Http\Request;
use App\Http\Resources\CarResource;

/**
 * @OA\Tag(
 *     name="Admin - Cars",
 *     description="API Endpoints for admin car management"
 * )
 */
class AdminCarController extends Controller
{
    protected $adminCarService;

    public function __construct(AdminCarService $adminCarService)
    {
        $this->adminCarService = $adminCarService;
    }

    /**
     * @OA\Get(
     *     path="/api/admin/cars",
     *     operationId="adminGetCars",
     *     tags={"Admin - Cars"},
     *     summary="Get all cars (admin)",
     *     description="Get a paginated list of all cars for admin (no store filtering)",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="per_page", in="query", description="Items per page", required=false, @OA\Schema(type="integer", default=9)),
     *     @OA\Parameter(name="brand_id", in="query", description="Filter by brand ID", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="type_id", in="query", description="Filter by type ID", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="store_id", in="query", description="Filter by store ID", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="transmission", in="query", description="Filter by transmission", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="fuel_type", in="query", description="Filter by fuel type", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="min_seats", in="query", description="Minimum seats", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="max_price", in="query", description="Maximum price", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="object")
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/admin/cars/{id}",
     *     operationId="adminGetCar",
     *     tags={"Admin - Cars"},
     *     summary="Get car details (admin)",
     *     description="Get detailed information about a specific car for admin",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="Car ID", @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/Car")
     *     ),
     *     @OA\Response(response=404, description="Car not found")
     * )
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
     * @OA\Get(
     *     path="/api/admin/cars/stats",
     *     operationId="adminGetCarStats",
     *     tags={"Admin - Cars"},
     *     summary="Get car statistics (admin)",
     *     description="Get car statistics for admin dashboard",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="store_id", in="query", description="Filter by store ID", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="total_cars", type="integer", example=500),
     *             @OA\Property(property="active_cars", type="integer", example=450),
     *             @OA\Property(property="inactive_cars", type="integer", example=50)
     *         )
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/admin/cars/filters",
     *     operationId="adminGetCarFilters",
     *     tags={"Admin - Cars"},
     *     summary="Get car filters (admin)",
     *     description="Get all available filters for cars (brands, types, stores) for admin",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="brands", type="array", @OA\Items(type="object")),
     *                 @OA\Property(property="types", type="array", @OA\Items(type="object")),
     *                 @OA\Property(property="stores", type="array", @OA\Items(type="object"))
     *             )
     *         )
     *     )
     * )
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
