<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @OA\Tag(
 *     name="Authentication",
 *     description="API Endpoints for user authentication"
 * )
 */
class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create()
    {
        return response()->json(['status' => 'register page']);
    }

    /**
     * @OA\Post(
     *     path="/api/register",
     *     operationId="register",
     *     tags={"Authentication"},
     *     summary="Register new user",
     *     description="Register a new user account. OTP must be verified first using /api/verify-signup-otp",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="user@example.com", nullable=true),
     *             @OA\Property(property="phone_number", type="string", example="+923001234567", nullable=true),
     *             @OA\Property(property="password", type="string", format="password", example="password123", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Registration successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="user", ref="#/components/schemas/User"),
     *             @OA\Property(property="token", type="string", example="1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"),
     *             @OA\Property(property="password_set", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error or OTP not verified")
     * )
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'nullable|string',
        ]);

        if (!$request->phone_number) {
            return response()->json(['message' => 'Email or phone number is required'], 422);
        }

        // Check if user already exists
        $identifier = $request->phone_number;
        $existingUser = User::where('phone_number', $request->phone_number)->first();

        if ($existingUser) {
            // User already exists - they should have been logged in during OTP verification
            // But if they reach here, log them in anyway
            $token = $existingUser->createToken('api-token')->plainTextToken;
            return response()->json([
                'success' => true,
                'user' => new \App\Http\Resources\UserResource($existingUser),
                'token' => $token,
                'password_set' => !empty($existingUser->password),
            ]);
        }

        // Check if OTP was verified
        $cacheKey = 'signup_otp_' . md5($identifier);
        $otpData = \Illuminate\Support\Facades\Cache::get($cacheKey);

        if (!$otpData || !isset($otpData['verified']) || !$otpData['verified']) {
            return response()->json(['message' => 'Please verify your OTP first'], 422);
        }

        $userData = [
            'name' => $request->name,
            'is_verified' => true,
            'email_verified_at' => now(),
        ];

        if ($request->email) {
            $userData['email'] = $request->email;
        }
        if ($request->phone_number) {
            $userData['phone_number'] = $request->phone_number;
        }

        // Password can come from request or from cache (if set during password step)
        if ($request->password) {
            $userData['password'] = Hash::make($request->password);
        } elseif (isset($otpData['password'])) {
            // Password was set during the password step and stored in cache
            $userData['password'] = $otpData['password'];
        }

        $user = User::create($userData);

        // Create default store for the user
        $storeName = $user->name . "'s Store";
        $baseUsername = Str::slug($user->name);

        // Fallback if slug is empty (e.g., name contains only special characters)
        if (empty($baseUsername)) {
            $baseUsername = 'store_' . $user->id;
        }

        $storeUsername = $baseUsername;

        // Ensure unique store username
        $counter = 1;
        while (Store::where('store_username', $storeUsername)->exists()) {
            $storeUsername = $baseUsername . '_' . $counter;
            $counter++;
        }

        // Ensure unique store name
        $counter = 1;
        $finalStoreName = $storeName;
        while (Store::where('name', $finalStoreName)->exists()) {
            $finalStoreName = $storeName . ' ' . $counter;
            $counter++;
        }

        $store = Store::create([
            'user_id' => $user->id,
            'name' => $finalStoreName,
            'store_username' => $storeUsername,
            'contact_phone' => $user->phone_number,
            'description' => 'Default store for ' . $user->name,
        ]);

        // Attach store to user using many-to-many relationship
        $user->stores()->attach($store->id);

        // Assign store_owner role to the user since they have a store
        $user->assignRole('store_owner');

        // Clear OTP cache
        \Illuminate\Support\Facades\Cache::forget($cacheKey);

        // Auto-login user after successful registration
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => new \App\Http\Resources\UserResource($user),
            'token' => $token,
            'password_set' => !empty($request->password),
        ]);
    }
}
