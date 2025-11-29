<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Year;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Years",
 *     description="API Endpoints for year management"
 * )
 */
class YearController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/years",
     *     operationId="getYears",
     *     tags={"Years"},
     *     summary="List years",
     *     description="Get a list of active years",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="year", type="integer", example=2024)
     *             ))
     *         )
     *     )
     * )
     * Display a listing of years.
     */
    public function index(Request $request)
    {
        $years = Year::active()
            ->ordered()
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $years->map(function ($year) {
                return [
                    'id' => $year->id,
                    'year' => $year->year,
                ];
            })
        ]);
    }
}