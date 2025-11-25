<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

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
        $credentials = $request->only('email', 'phone_number', 'password');
        
        if (!$credentials['email'] && !$credentials['phone_number']) {
            return response()->json(['message' => 'Email or phone number is required'], 422);
        }

        if (!$credentials['password']) {
            return response()->json(['message' => 'Password is required'], 422);
        }

        $user = $credentials['email'] 
            ? \App\Models\User::where('email', $credentials['email'])->first()
            : \App\Models\User::where('phone_number', $credentials['phone_number'])->first();

        if (! $user || ! \Illuminate\Support\Facades\Hash::check($credentials['password'], $user->password)) {
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
