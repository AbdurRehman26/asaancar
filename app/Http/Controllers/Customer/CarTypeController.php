<?php

namespace App\Http\Controllers\Customer;

use App\Models\CarType;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\CarTypeResource;

/**
 * @OA\Tag(
 *     name="Car Types",
 *     description="API Endpoints for car type management"
 * )
 */
class CarTypeController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/customer/car-types",
     *     operationId="getCarTypesList",
     *     tags={"Car Types"},
     *     summary="Get list of car types",
     *     description="Returns list of car types with pagination",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/CarType")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="per_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     )
     * )
     */
    public function index()
    {
        $types = CarType::paginate(10);
        return CarTypeResource::collection($types);
    }
}
