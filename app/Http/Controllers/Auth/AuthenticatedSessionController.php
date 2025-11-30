<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/**
 * @OA\Tag(
 *     name="Authentication",
 *     description="API Endpoints for user authentication"
 * )
 */
class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request)
    {
        return response()->json([
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/login",
     *     operationId="login",
     *     tags={"Authentication"},
     *     summary="Login user",
     *     description="Authenticate user with email/phone and password",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"login_method"},
     *             @OA\Property(property="email", type="string", format="email", example="user@example.com", nullable=true),
     *             @OA\Property(property="phone_number", type="string", example="+923001234567", nullable=true),
     *             @OA\Property(property="password", type="string", format="password", example="password123", nullable=true),
     *             @OA\Property(property="login_method", type="string", enum={"password", "otp"}, example="password")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="token", type="string", example="1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"),
     *             @OA\Property(property="user", ref="#/components/schemas/User")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Invalid credentials"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     * Handle an incoming authentication request (API login).
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'nullable|email',
            'phone_number' => 'nullable|string',
            'password' => 'nullable|string',
            'login_method' => 'required|in:password,otp',
        ]);

        if ($request->login_method === 'otp') {
            // OTP login is handled by OtpController
            return response()->json(['message' => 'Use /api/send-login-otp endpoint'], 400);
        }

        // Password login
        $email = $request->input('email');
        $phoneNumber = $request->input('phone_number');
        $password = $request->input('password');
        
        if (!$email && !$phoneNumber) {
            return response()->json(['message' => 'Email or phone number is required'], 422);
        }

        // Demo login: If phone number is +923202095051, automatically log in without password
        $demoPhoneNumber = '+923202095051';
        if ($phoneNumber === $demoPhoneNumber) {
            $user = \App\Models\User::where('phone_number', $demoPhoneNumber)->first();
            
            if (!$user) {
                return response()->json(['message' => 'Demo user not found'], 404);
            }

            // Automatically log in demo user
            $token = $user->createToken('demo-api-token')->plainTextToken;

            return response()->json([
                'token' => $token,
                'user' => new \App\Http\Resources\UserResource($user),
                'message' => 'Demo login successful',
            ]);
        }

        // Regular password login flow
        if (!$password) {
            return response()->json(['message' => 'Password is required'], 422);
        }

        $user = $email 
            ? \App\Models\User::where('email', $email)->first()
            : \App\Models\User::where('phone_number', $phoneNumber)->first();

        if (! $user) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Check if user has a password set
        if (!$user->password) {
            return response()->json(['message' => 'Password not set. Please use OTP login or set a password first.'], 401);
        }

        if (! \Illuminate\Support\Facades\Hash::check($password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$user->is_verified && is_null($user->email_verified_at)) {
            return response()->json(['message' => 'Please verify your account before logging in.'], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new \App\Http\Resources\UserResource($user),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/logout",
     *     operationId="logout",
     *     tags={"Authentication"},
     *     summary="Logout user",
     *     description="Destroy the authenticated session and revoke the access token",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logout successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        // For API: delete the current access token (Sanctum)
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }
        return response()->json(['message' => true]);
    }
}
