<?php

namespace App\Http\Controllers\Customer;

use App\Models\CarBrand;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\CarBrandResource;

/**
 * @OA\Tag(
 *     name="Car Brands",
 *     description="API Endpoints for car brand management"
 * )
 */
class CarBrandController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/customer/car-brands",
     *     operationId="getCarBrandsList",
     *     tags={"Car Brands"},
     *     summary="Get list of car brands",
     *     description="Returns list of car brands with pagination",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/CarBrand")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="per_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     )
     * )
     */
    public function index()
    {
        $brands = CarBrand::paginate(10);
        return CarBrandResource::collection($brands);
    }
}
