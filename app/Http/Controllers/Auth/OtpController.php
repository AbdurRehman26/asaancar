<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\OtpNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class OtpController extends Controller
{
    /**
     * Send OTP for login
     */
    public function sendLoginOtp(Request $request)
    {
        $request->validate([
            'email' => 'nullable|email',
            'phone_number' => 'nullable|string',
        ]);

        if (!$request->email && !$request->phone_number) {
            return response()->json(['message' => 'Email or phone number is required'], 422);
        }

        $isEmail = !empty($request->email);
        $identifier = $isEmail ? $request->email : $request->phone_number;

        $user = $isEmail 
            ? User::where('email', $request->email)->first()
            : User::where('phone_number', $request->phone_number)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Generate 6-digit OTP
        $otp = str_pad((string) rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store OTP in user record
        $user->otp_code = Hash::make($otp);
        $user->otp_expires_at = now()->addMinutes(10);
        $user->save();

        // Send OTP notification
        $user->notify(new OtpNotification($otp, $isEmail));

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully',
            'identifier' => $identifier,
            'is_email' => $isEmail,
        ]);
    }

    /**
     * Verify OTP for login
     */
    public function verifyLoginOtp(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->identifier)
            ->orWhere('phone_number', $request->identifier)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Check if OTP exists and is not expired
        if (!$user->otp_code || !$user->otp_expires_at || $user->otp_expires_at->isPast()) {
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 400);
        }

        // Verify OTP
        if (!Hash::check($request->otp, $user->otp_code)) {
            return response()->json(['message' => 'Invalid OTP'], 400);
        }

        // Clear OTP
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->is_verified = true;
        if (!$user->email_verified_at) {
            $user->email_verified_at = now();
        }
        $user->save();

        // Create token
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => new \App\Http\Resources\UserResource($user),
        ]);
    }

    /**
     * Send OTP for signup
     */
    public function sendSignupOtp(Request $request)
    {
        $request->validate([
            'email' => 'nullable|email|unique:users,email',
            'phone_number' => 'nullable|string|unique:users,phone_number',
        ]);

        if (!$request->email && !$request->phone_number) {
            return response()->json(['message' => 'Email or phone number is required'], 422);
        }

        $isEmail = !empty($request->email);
        $identifier = $isEmail ? $request->email : $request->phone_number;

        // Generate 6-digit OTP
        $otp = str_pad((string) rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store OTP in session or cache (we'll use a temporary approach)
        // For production, use cache with identifier as key
        $cacheKey = 'signup_otp_' . md5($identifier);
        \Illuminate\Support\Facades\Cache::put($cacheKey, [
            'otp' => Hash::make($otp),
            'expires_at' => now()->addMinutes(10),
            'identifier' => $identifier,
            'is_email' => $isEmail,
        ], now()->addMinutes(10));

        // Create temporary user to send notification (or use a service)
        $tempUser = new User();
        if ($isEmail) {
            $tempUser->email = $request->email;
        } else {
            $tempUser->phone_number = $request->phone_number;
        }
        $tempUser->notify(new OtpNotification($otp, $isEmail));

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully',
            'identifier' => $identifier,
            'is_email' => $isEmail,
        ]);
    }

    /**
     * Verify OTP for signup
     */
    public function verifySignupOtp(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        $cacheKey = 'signup_otp_' . md5($request->identifier);
        $otpData = \Illuminate\Support\Facades\Cache::get($cacheKey);

        if (!$otpData) {
            return response()->json(['message' => 'OTP not found or expired'], 400);
        }

        if (now()->isAfter($otpData['expires_at'])) {
            \Illuminate\Support\Facades\Cache::forget($cacheKey);
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 400);
        }

        // Verify OTP
        if (!Hash::check($request->otp, $otpData['otp'])) {
            return response()->json(['message' => 'Invalid OTP'], 400);
        }

        // Clear OTP from cache
        \Illuminate\Support\Facades\Cache::forget($cacheKey);

        // Mark OTP as verified in cache
        $otpData['verified'] = true;
        \Illuminate\Support\Facades\Cache::put($cacheKey, $otpData, now()->addMinutes(30));

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully',
            'identifier' => $otpData['identifier'],
            'is_email' => $otpData['is_email'],
        ]);
    }

    /**
     * Set password after OTP verification (optional)
     */
    public function setPassword(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $request->identifier)
            ->orWhere('phone_number', $request->identifier)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password set successfully',
        ]);
    }
}
