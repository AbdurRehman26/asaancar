<?php

namespace App\Http\Controllers\Customer;

/**
 * @OA\Tag(
 *     name="Cars",
 *     description="API Endpoints for car management"
 * )
 */

use App\Http\Controllers\Controller;
use App\Http\Resources\CarResource;
use App\Services\CarService;
use App\Models\Car;
use App\Http\Requests\Car\CreateCarRequest;
use App\Http\Requests\Car\UpdateCarRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Cars",
 *     description="API Endpoints for car management"
 * )
 */
class CarController extends Controller
{
    protected $carService;

    public function __construct(CarService $carService)
    {
        $this->carService = $carService;
    }

    /**
     * @OA\Get(
     *     path="/api/customer/cars",
     *     operationId="getCarsList",
     *     tags={"Cars"},
     *     summary="Get list of cars",
     *     description="Returns list of cars with pagination",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Car")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="per_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 9);
        $filters = $request->only([
            'brand_id', 'type_id', 'store_id', 'transmission',
            'fuel_type', 'min_seats', 'max_price'
        ]);
        $paginated = $this->carService->getPaginatedCarsForListing($perPage, $filters);
        return response()->json($paginated);
    }

    /**
     * @OA\Post(
     *     path="/api/customer/cars",
     *     operationId="storeCar",
     *     tags={"Cars"},
     *     summary="Store a new car",
     *     description="Creates a new car record",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CarRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Car created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Car")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function store(CreateCarRequest $request)
    {
        $validated = $request->validated();
        $car = Car::create($validated);
        return new CarResource($car->load(['carBrand', 'carType', 'carEngine', 'store']));
    }

    /**
     * @OA\Get(
     *     path="/api/customer/cars/{id}",
     *     operationId="getCarById",
     *     tags={"Cars"},
     *     summary="Get car information",
     *     description="Returns car data by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Car ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/Car")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Car not found"
     *     )
     * )
     */
    public function show(int $id)
    {
        $car = $this->carService->getCarForListing($id);
        if (!$car) {
            return response()->json(['message' => 'Car not found'], 404);
        }
        return response()->json(['data' => $car]);
    }

    /**
     * @OA\Put(
     *     path="/api/customer/cars/{id}",
     *     operationId="updateCar",
     *     tags={"Cars"},
     *     summary="Update car information",
     *     description="Updates car data by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Car ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CarRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Car updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Car")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Car not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function update(UpdateCarRequest $request, string $id)
    {
        $car = Car::findOrFail($id);
        $validated = $request->validated();
        $car->update($validated);
        return new CarResource($car->load(['carBrand', 'carType', 'carEngine', 'store']));
    }

    public function search(Request $request)
    {
        $filters = $request->only([
            'brand_id', 'type_id', 'store_id', 'transmission',
            'fuel_type', 'min_seats', 'max_price'
        ]);

        $cars = $this->carService->searchCars($filters);

        return response()->json([
            'success' => true,
            'data' => $cars
        ]);
    }

    public function getFilters()
    {
        $brands = $this->carService->getCarBrands();
        $types = $this->carService->getCarTypes();
        $stores = $this->carService->getStores();

        return response()->json([
            'success' => true,
            'data' => [
                'brands' => $brands,
                'types' => $types,
                'stores' => $stores,
            ]
        ]);
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        // Get all store IDs for this user
        $storeIds = $user->stores()->pluck('id');
        $count = \App\Models\Car::whereIn('store_id', $storeIds)->count();
        return response()->json(['count' => $count]);
    }

    /**
     * @OA\Delete(
     *     path="/api/customer/cars/{id}",
     *     operationId="deleteCar",
     *     tags={"Cars"},
     *     summary="Delete car",
     *     description="Deletes car by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Car ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Car deleted successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="Car deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Car not found"
     *     )
     * )
     */
    public function destroy(string $id)
    {
        $car = Car::findOrFail($id);
        $car->delete();

        return response()->json(['message' => 'Car deleted successfully']);
    }
}
