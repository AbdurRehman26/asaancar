<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
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
     * Get user statistics for admin dashboard
     */
    public function stats(Request $request)
    {
        $storeId = $request->get('store_id');
        
        $query = User::query();
        
        // If store_id is provided, filter users who are associated with that store
        if ($storeId) {
            $query->whereHas('stores', function($q) use ($storeId) {
                $q->where('stores.id', $storeId);
            });
        }
        
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