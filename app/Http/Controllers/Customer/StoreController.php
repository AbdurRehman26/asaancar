<?php

namespace App\Http\Controllers\Customer;

use App\Models\Store;
use App\Http\Requests\Store\CreateStoreRequest;
use App\Http\Requests\Store\UpdateStoreRequest;
use App\Http\Controllers\Controller;
use App\Http\Resources\StoreResource;
use App\Models\City;

/**
 * @OA\Tag(
 *     name="Stores",
 *     description="API Endpoints for store management"
 * )
 */
class StoreController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/customer/stores",
     *     operationId="getStoresList",
     *     tags={"Stores"},
     *     summary="Get list of stores",
     *     description="Returns list of stores with pagination",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Store")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="per_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     )
     * )
     */
    public function index()
    {
        $stores = Store::paginate(10);
        $cities = City::all();
        return response()->json([
            'stores' => StoreResource::collection($stores),
            'cities' => $cities->map(fn($city) => ['id' => $city->id, 'name' => $city->name]),
            'current_page' => $stores->currentPage(),
            'per_page' => $stores->perPage(),
            'total' => $stores->total(),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/customer/stores",
     *     operationId="storeStore",
     *     tags={"Stores"},
     *     summary="Store a new store",
     *     description="Creates a new store record",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/StoreRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Store created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Store")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function store(CreateStoreRequest $request)
    {
        $validated = $request->validated();
        $store = Store::create($validated);
        return new StoreResource($store);
    }

    /**
     * @OA\Get(
     *     path="/api/customer/stores/{id}",
     *     operationId="getStoreById",
     *     tags={"Stores"},
     *     summary="Get store information",
     *     description="Returns store data by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Store ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/Store")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Store not found"
     *     )
     * )
     */
    public function show(string $id)
    {
        $store = Store::findOrFail($id);
        return new StoreResource($store);
    }

    /**
     * @OA\Put(
     *     path="/api/customer/stores/{id}",
     *     operationId="updateStore",
     *     tags={"Stores"},
     *     summary="Update store information",
     *     description="Updates store data by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Store ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/StoreRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Store updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Store")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Store not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function update(UpdateStoreRequest $request, string $id)
    {
        $store = Store::findOrFail($id);
        $validated = $request->validated();
        $store->update($validated);
        return new StoreResource($store);
    }

    /**
     * @OA\Delete(
     *     path="/api/customer/stores/{id}",
     *     operationId="deleteStore",
     *     tags={"Stores"},
     *     summary="Delete store",
     *     description="Deletes store by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Store ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Store deleted successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="Store deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Store not found"
     *     )
     * )
     */
    public function destroy(string $id)
    {
        $store = Store::findOrFail($id);
        $store->delete();
        
        return response()->json(['message' => 'Store deleted successfully']);
    }
}
