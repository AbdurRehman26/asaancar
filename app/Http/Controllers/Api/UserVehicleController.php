<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserVehicleRequest;
use App\Http\Resources\UserVehicleResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * @OA\Tag(
 *     name="User Vehicles",
 *     description="Saved vehicle endpoints used for driver onboarding and ride creation"
 * )
 */
class UserVehicleController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/user/vehicles",
     *     operationId="listUserVehicles",
     *     tags={"User Vehicles"},
     *     summary="List saved user vehicles",
     *     description="Returns the authenticated user's saved vehicles, with default vehicles first.",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Saved vehicles fetched successfully",
     *
     *         @OA\JsonContent(
     *             type="object",
     *
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/UserVehicle"))
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $vehicles = $request->user()
            ->userVehicles()
            ->latest('is_default')
            ->latest('id')
            ->get();

        return UserVehicleResource::collection($vehicles);
    }

    /**
     * @OA\Post(
     *     path="/api/user/vehicles",
     *     operationId="storeUserVehicle",
     *     tags={"User Vehicles"},
     *     summary="Save a user vehicle",
     *     description="Stores a new saved vehicle for the authenticated user. The first saved vehicle becomes default automatically.",
     *     security={{"sanctum": {}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"vehicle_type"},
     *
     *             @OA\Property(property="vehicle_type", type="string", enum={"car", "bike"}, example="car"),
     *             @OA\Property(property="brand", type="string", nullable=true, example="Toyota"),
     *             @OA\Property(property="model", type="string", nullable=true, example="Corolla"),
     *             @OA\Property(property="color", type="string", nullable=true, example="White"),
     *             @OA\Property(property="seats", type="integer", nullable=true, example=4),
     *             @OA\Property(property="transmission", type="string", nullable=true, enum={"manual", "automatic"}, example="automatic"),
     *             @OA\Property(property="fuel_type", type="string", nullable=true, enum={"petrol", "diesel", "electric", "hybrid"}, example="petrol"),
     *             @OA\Property(property="is_default", type="boolean", nullable=true, example=true)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Vehicle saved successfully",
     *
     *         @OA\JsonContent(
     *             type="object",
     *
     *             @OA\Property(property="message", type="string", example="Vehicle saved successfully."),
     *             @OA\Property(property="data", ref="#/components/schemas/UserVehicle")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreUserVehicleRequest $request): JsonResponse
    {
        $user = $request->user();
        $payload = $request->validated();
        $isDefault = (bool) ($payload['is_default'] ?? false);

        if (! $user->userVehicles()->exists()) {
            $isDefault = true;
        }

        if ($isDefault) {
            $user->userVehicles()->update(['is_default' => false]);
        }

        $vehicle = $user->userVehicles()->create([
            ...$payload,
            'is_default' => $isDefault,
        ]);

        return response()->json([
            'message' => 'Vehicle saved successfully.',
            'data' => new UserVehicleResource($vehicle),
        ], 201);
    }
}
