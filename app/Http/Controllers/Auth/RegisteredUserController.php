<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

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

        // Auto-login if password was set
        $token = null;
        if ($request->password) {
            $token = $user->createToken('api-token')->plainTextToken;
        }

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token,
            'password_set' => !empty($request->password),
        ]);
    }
}
