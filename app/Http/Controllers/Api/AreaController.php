<?php

namespace App\Http\Controllers\Api;

use App\Models\Area;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Areas",
 *     description="API Endpoints for area management"
 * )
 */
class AreaController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/areas",
     *     operationId="getAreas",
     *     tags={"Areas"},
     *     summary="List areas",
     *     description="Get a list of active areas, optionally filtered by city",
     *     @OA\Parameter(name="city_id", in="query", description="Filter by city ID", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="city_id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Clifton"),
     *                 @OA\Property(property="slug", type="string", example="clifton")
     *             ))
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = Area::where('is_active', true);
        
        // Filter by city_id if provided
        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }
        
        return response()->json([
            'data' => $query->get(['id', 'city_id', 'name', 'slug'])
        ]);
    }
}
