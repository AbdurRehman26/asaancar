<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Users",
 *     description="API Endpoints for user management"
 * )
 */
class UserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/user",
     *     operationId="getCurrentUser",
     *     tags={"Users"},
     *     summary="Get current user",
     *     description="Get the authenticated user's information",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/User")
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     * Get the authenticated user's information
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        return new UserResource($user);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/users/stats",
     *     operationId="getUserStats",
     *     tags={"Users"},
     *     summary="Get user statistics",
     *     description="Get user statistics for admin dashboard",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="total_users", type="integer", example=500),
     *             @OA\Property(property="verified_users", type="integer", example=450),
     *             @OA\Property(property="unverified_users", type="integer", example=50)
     *         )
     *     )
     * )
     * Get user statistics for admin dashboard
     */
    public function stats(Request $request)
    {
        $query = User::query();
        
        $totalUsers = $query->count();
        $verifiedUsers = $query->clone()->whereNotNull('email_verified_at')->count();
        $unverifiedUsers = $query->clone()->whereNull('email_verified_at')->count();
        
        return response()->json([
            'total_users' => $totalUsers,
            'verified_users' => $verifiedUsers,
            'unverified_users' => $unverifiedUsers,
        ]);
    }
}