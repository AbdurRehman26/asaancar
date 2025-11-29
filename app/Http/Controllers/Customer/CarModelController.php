<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CarModel;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Car Models",
 *     description="API Endpoints for car model management"
 * )
 */
class CarModelController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/car-models",
     *     operationId="getCarModels",
     *     tags={"Car Models"},
     *     summary="List car models",
     *     description="Get a list of car models, optionally filtered by brand",
     *     @OA\Parameter(name="brand_id", in="query", description="Filter by brand ID", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Civic"),
     *                 @OA\Property(property="slug", type="string", example="civic"),
     *                 @OA\Property(property="car_brand_id", type="integer", example=1),
     *                 @OA\Property(property="brand_name", type="string", example="Honda")
     *             ))
     *         )
     *     )
     * )
     * Display a listing of car models.
     */
    public function index(Request $request)
    {
        $query = CarModel::with('carBrand');
        
        // Filter by brand if provided
        if ($request->has('brand_id')) {
            $query->where('car_brand_id', $request->input('brand_id'));
        }
        
        $models = $query->orderBy('name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $models->map(function ($model) {
                return [
                    'id' => $model->id,
                    'name' => $model->name,
                    'slug' => $model->slug,
                    'car_brand_id' => $model->car_brand_id,
                    'brand_name' => $model->carBrand->name ?? null,
                ];
            })
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/car-models/brand/{brandId}",
     *     operationId="getCarModelsByBrand",
     *     tags={"Car Models"},
     *     summary="Get car models by brand",
     *     description="Get a list of car models for a specific brand",
     *     @OA\Parameter(name="brandId", in="path", required=true, description="Brand ID", @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Civic"),
     *                 @OA\Property(property="slug", type="string", example="civic")
     *             ))
     *         )
     *     )
     * )
     * Get models by brand ID
     */
    public function getByBrand($brandId)
    {
        $models = CarModel::where('car_brand_id', $brandId)
            ->orderBy('name')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $models->map(function ($model) {
                return [
                    'id' => $model->id,
                    'name' => $model->name,
                    'slug' => $model->slug,
                ];
            })
        ]);
    }
}