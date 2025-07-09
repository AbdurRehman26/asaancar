<?php

namespace App\Http\Controllers\Customer;

use App\Models\CarEngine;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\CarEngineResource;

/**
 * @OA\Tag(
 *     name="Car Engines",
 *     description="API Endpoints for car engine management"
 * )
 */
class CarEngineController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/customer/car-engines",
     *     operationId="getCarEnginesList",
     *     tags={"Car Engines"},
     *     summary="Get list of car engines",
     *     description="Returns list of car engines with pagination",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/CarEngine")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="per_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     )
     * )
     */
    public function index()
    {
        $engines = CarEngine::paginate(10);
        return CarEngineResource::collection($engines);
    }
}
