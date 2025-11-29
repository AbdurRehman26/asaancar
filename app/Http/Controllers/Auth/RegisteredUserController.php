<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
     *             required={"name", "role"},
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="user@example.com", nullable=true),
     *             @OA\Property(property="phone_number", type="string", example="+923001234567", nullable=true),
     *             @OA\Property(property="password", type="string", format="password", example="password123", nullable=true),
     *             @OA\Property(property="role", type="string", enum={"user", "store_owner"}, example="user")
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
            'email' => 'nullable|string|lowercase|email|max:255|unique:'.User::class,
            'phone_number' => 'nullable|string|unique:'.User::class,
            'role' => 'required|in:user,store_owner',
        ]);

        if (!$request->email && !$request->phone_number) {
            return response()->json(['message' => 'Email or phone number is required'], 422);
        }

        // Check if OTP was verified
        $identifier = $request->email ?? $request->phone_number;
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

        // Password is optional - can be set later
        if ($request->password) {
            $userData['password'] = Hash::make($request->password);
        }

        $user = User::create($userData);

        // Assign role using Spatie
        $user->assignRole($request->role);

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
