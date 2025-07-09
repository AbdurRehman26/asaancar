<?php

namespace App\Http\Controllers\Customer;

/**
 * @OA\Tag(
 *     name="Cars",
 *     description="API Endpoints for car management"
 * )
 */

use App\Models\Car;
use App\Models\CarBrand;
use App\Models\CarType;
use App\Models\CarEngine;
use App\Models\Store;
use App\Http\Requests\Car\CreateCarRequest;
use App\Http\Requests\Car\UpdateCarRequest;
use App\Http\Controllers\Controller;
use App\Http\Resources\CarResource;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(
 *     name="Cars",
 *     description="API Endpoints for car management"
 * )
 */
class CarController extends Controller
{
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
    public function index()
    {
        $cars = Car::with(['brand', 'type', 'engine', 'store'])->paginate(10);
        return CarResource::collection($cars);
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
        return new CarResource($car->load(['brand', 'type', 'engine', 'store']));
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
    public function show(string $id)
    {
        $car = Car::with(['brand', 'type', 'engine', 'store'])->findOrFail($id);
        return new CarResource($car);
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
        return new CarResource($car->load(['brand', 'type', 'engine', 'store']));
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
