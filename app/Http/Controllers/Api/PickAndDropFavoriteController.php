<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PickAndDropResource;
use App\Models\PickAndDropFavorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PickAndDropFavoriteController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/customer/pick-and-drop/favorites",
     *     operationId="getPickAndDropFavorites",
     *     tags={"Pick & Drop Favorites"},
     *     summary="List favorite pick and drop services",
     *     description="Get a paginated list of the authenticated user's favorite pick and drop services",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/PickAndDrop")),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
    public function index()
    {
        $user = Auth::user();
        $favorites = $user->favoritePickAndDrops()
            ->with(['user', 'stops.city', 'stops.area', 'pickupCity', 'dropoffCity', 'pickupArea', 'dropoffArea'])
            ->paginate();

        return PickAndDropResource::collection($favorites);
    }

    /**
     * @OA\Post(
     *     path="/api/customer/pick-and-drop/favorites",
     *     operationId="addPickAndDropFavorite",
     *     tags={"Pick & Drop Favorites"},
     *     summary="Add a service to favorites",
     *     description="Add a specific pick and drop service to the user's favorites",
     *     security={{"sanctum": {}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"pick_and_drop_service_id"},
     *
     *             @OA\Property(property="pick_and_drop_service_id", type="integer", example=1)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Service added to favorites",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Service added to favorites"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'pick_and_drop_service_id' => 'required|integer|exists:pick_and_drop_services,id',
        ]);

        $favorite = PickAndDropFavorite::firstOrCreate([
            'user_id' => Auth::id(),
            'pick_and_drop_service_id' => $request->pick_and_drop_service_id,
        ]);

        return response()->json([
            'message' => 'Service added to favorites',
            'data' => $favorite,
        ], 201);
    }

    /**
     * @OA\Delete(
     *     path="/api/customer/pick-and-drop/favorites/{id}",
     *     operationId="removePickAndDropFavorite",
     *     tags={"Pick & Drop Favorites"},
     *     summary="Remove a service from favorites",
     *     description="Remove a specific pick and drop service from the user's favorites",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Parameter(name="id", in="path", required=true, description="Pick and Drop Service ID", @OA\Schema(type="integer")),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Service removed from favorites",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Service removed from favorites")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Favorite not found")
     * )
     */
    public function destroy(string $id)
    {
        $favorite = PickAndDropFavorite::where('user_id', Auth::id())
            ->where('pick_and_drop_service_id', $id)
            ->firstOrFail();

        $favorite->delete();

        return response()->json([
            'message' => 'Service removed from favorites',
        ]);
    }
}
