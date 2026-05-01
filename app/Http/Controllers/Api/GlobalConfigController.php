<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

/**
 * @OA\Tag(
 *     name="Global Config",
 *     description="Public API configuration endpoints"
 * )
 */
class GlobalConfigController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/config",
     *     operationId="getGlobalConfig",
     *     tags={"Global Config"},
     *     summary="Get global API config",
     *     description="Returns public configuration values needed by clients such as the Android app version.",
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="android_version", type="string", example="2.3.0")
     *             ),
     *             @OA\Property(property="message", type="string", example="Global config fetched successfully.")
     *         )
     *     )
     * )
     */
    public function __invoke()
    {
        return response()->json([
            'data' => [
                'android_version' => config('app.android_version'),
            ],
            'message' => 'Global config fetched successfully.',
        ]);
    }
}
