<?php

namespace App\Http\Controllers\Customer;

use App\Models\City;
use App\Http\Controllers\Controller;
use App\Http\Resources\CityResource;

/**
 * @OA\Tag(
 *     name="Cities",
 *     description="API Endpoints for city management"
 * )
 */
class CityController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/cities",
     *     operationId="getCities",
     *     tags={"Cities"},
     *     summary="List cities",
     *     description="Get a list of all cities",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/City"))
     *         )
     *     )
     * )
     */
    public function index()
    {
        return CityResource::collection(City::all());
    }
} 