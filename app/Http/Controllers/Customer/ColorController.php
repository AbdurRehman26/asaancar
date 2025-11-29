<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Color;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Colors",
 *     description="API Endpoints for color management"
 * )
 */
class ColorController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/colors",
     *     operationId="getColors",
     *     tags={"Colors"},
     *     summary="List colors",
     *     description="Get a list of active colors",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Red"),
     *                 @OA\Property(property="hex_code", type="string", example="#FF0000"),
     *                 @OA\Property(property="slug", type="string", example="red")
     *             ))
     *         )
     *     )
     * )
     * Display a listing of colors.
     */
    public function index(Request $request)
    {
        $colors = Color::active()
            ->orderBy('name')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $colors->map(function ($color) {
                return [
                    'id' => $color->id,
                    'name' => $color->name,
                    'hex_code' => $color->hex_code,
                    'slug' => $color->slug,
                ];
            })
        ]);
    }
}