<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\OtpNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Twilio\Rest\Client;

/**
 * @OA\Tag(
 *     name="OTP",
 *     description="API Endpoints for OTP (One-Time Password) authentication"
 * )
 */
class OtpController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/send-login-otp",
     *     operationId="sendLoginOtp",
     *     tags={"OTP"},
     *     summary="Send OTP for login",
     *     description="Send OTP via email or SMS for user login",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="email", type="string", format="email", example="user@example.com", nullable=true),
     *             @OA\Property(property="phone_number", type="string", example="+923001234567", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OTP sent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="OTP sent successfully"),
     *             @OA\Property(property="identifier", type="string", example="+923001234567"),
     *             @OA\Property(property="is_email", type="boolean", example=false)
     *         )
     *     ),
     *     @OA\Response(response=404, description="User not found"),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=500, description="Failed to send OTP")
     * )
     * Send OTP for login
     */
    public function sendLoginOtp(Request $request)
    {
        $request->validate([
            'phone_number' => 'string',
        ]);

        if (!$request->phone_number) {
            return response()->json(['message' => 'Email or phone number is required'], 422);
        }

        $identifier = $request->phone_number;

        // Demo login: If phone number is +923202095051, automatically log in without OTP
        $demoPhoneNumber = '+923202095051';
        if ($request->phone_number === $demoPhoneNumber) {
            $user = User::where('phone_number', $demoPhoneNumber)->first();

            if (!$user) {
                return response()->json(['message' => 'Demo user not found'], 404);
            }

            // Automatically verify and log in demo user
            $user->is_verified = true;
            if (!$user->email_verified_at) {
                $user->email_verified_at = now();
            }
            $user->save();

            // Create token and return immediately
            $token = $user->createToken('demo-api-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => new \App\Http\Resources\UserResource($user),
                'message' => 'Demo login successful',
            ]);
        }

        // Regular OTP flow for non-demo users
        $user = User::where('phone_number', $request->phone_number)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // For SMS, use Twilio Verify API
        try {
            $accountSid = config('services.twilio.account_sid');
            $authToken = config('services.twilio.auth_token');
            $verifyServiceSid = config('services.twilio.verify_service_sid');

            if (!$accountSid || !$authToken || !$verifyServiceSid) {
                return response()->json(['message' => 'Twilio configuration is missing'], 500);
            }

            $client = new Client($accountSid, $authToken);
            $verification = $client->verify->v2->services($verifyServiceSid)
                ->verifications
                ->create($request->phone_number, 'sms');

            // Store verification SID for later verification
            $user->otp_code = $verification->sid; // Store verification SID instead of hashed OTP
            $user->otp_expires_at = now()->addMinutes(10);
            $user->save();

        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send OTP. Please try again.'], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully',
            'identifier' => $identifier,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/verify-login-otp",
     *     operationId="verifyLoginOtp",
     *     tags={"OTP"},
     *     summary="Verify OTP for login",
     *     description="Verify OTP and authenticate user",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"identifier", "otp"},
     *             @OA\Property(property="identifier", type="string", example="+923001234567", description="Email or phone number"),
     *             @OA\Property(property="otp", type="string", example="123456", description="6-digit OTP code")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OTP verified and login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="token", type="string", example="1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"),
     *             @OA\Property(property="user", ref="#/components/schemas/User")
     *         )
     *     ),
     *     @OA\Response(response=400, description="Invalid or expired OTP"),
     *     @OA\Response(response=404, description="User not found"),
     *     @OA\Response(response=500, description="Failed to verify OTP")
     * )
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

        $isEmail = !empty($user->email) && $user->email === $request->identifier;

        if ($isEmail) {
            // For email, use the existing verification
            if (!$user->otp_code || !$user->otp_expires_at || $user->otp_expires_at->isPast()) {
                return response()->json(['message' => 'OTP has expired. Please request a new one.'], 400);
            }

            if (!Hash::check($request->otp, $user->otp_code)) {
                return response()->json(['message' => 'Invalid OTP'], 400);
            }
        } else {
            // For SMS, use Twilio Verify API
            try {
                $accountSid = config('services.twilio.account_sid');
                $authToken = config('services.twilio.auth_token');
                $verifyServiceSid = config('services.twilio.verify_service_sid');

                if (!$accountSid || !$authToken || !$verifyServiceSid) {
                    return response()->json(['message' => 'Twilio configuration is missing'], 500);
                }

                // Check if verification was initiated
                if (!$user->otp_code || !$user->otp_expires_at || $user->otp_expires_at->isPast()) {
                    return response()->json(['message' => 'OTP has expired. Please request a new one.'], 400);
                }

                $client = new Client($accountSid, $authToken);
                $verificationCheck = $client->verify->v2->services($verifyServiceSid)
                    ->verificationChecks
                    ->create([
                        'to' => $request->identifier,
                        'code' => $request->otp
                    ]);

                if ($verificationCheck->status !== 'approved') {
                    return response()->json(['message' => 'Invalid OTP'], 400);
                }

                \Log::info('Twilio Verify OTP verified', [
                    'verification_sid' => $verificationCheck->sid,
                    'phone_number' => $request->identifier,
                    'status' => $verificationCheck->status,
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to verify Twilio Verify OTP', [
                    'error' => $e->getMessage(),
                    'phone_number' => $request->identifier,
                ]);
                return response()->json(['message' => 'Failed to verify OTP. Please try again.'], 500);
            }
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
     * @OA\Post(
     *     path="/api/send-signup-otp",
     *     operationId="sendSignupOtp",
     *     tags={"OTP"},
     *     summary="Send OTP for signup",
     *     description="Send OTP via email or SMS for new user registration",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="email", type="string", format="email", example="newuser@example.com", nullable=true),
     *             @OA\Property(property="phone_number", type="string", example="+923001234567", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OTP sent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="OTP sent successfully"),
     *             @OA\Property(property="identifier", type="string", example="+923001234567"),
     *             @OA\Property(property="is_email", type="boolean", example=false),
     *             @OA\Property(property="is_existing_user", type="boolean", example=false, description="True if user already exists (will log in after OTP verification)")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=500, description="Failed to send OTP")
     * )
     * Send OTP for signup. If phone number/email already exists, OTP will be sent for login instead.
     */
    public function sendSignupOtp(Request $request)
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

        // Check if user already exists
        $existingUser = $isEmail
            ? User::where('email', $request->email)->first()
            : User::where('phone_number', $request->phone_number)->first();

        $isExistingUser = $existingUser !== null;

        if ($isExistingUser) {
            // User exists - use login OTP flow
            if ($isEmail) {
                // For email, use the existing notification system
                $otp = str_pad((string) rand(0, 999999), 6, '0', STR_PAD_LEFT);
                $existingUser->otp_code = Hash::make($otp);
                $existingUser->otp_expires_at = now()->addMinutes(10);
                $existingUser->save();
                $existingUser->notify(new OtpNotification($otp, true));
            } else {
                // For SMS, use Twilio Verify API
                try {
                    $accountSid = config('services.twilio.account_sid');
                    $authToken = config('services.twilio.auth_token');
                    $verifyServiceSid = config('services.twilio.verify_service_sid');

                    if (!$accountSid || !$authToken || !$verifyServiceSid) {
                        return response()->json(['message' => 'Twilio configuration is missing'], 500);
                    }

                    $client = new Client($accountSid, $authToken);
                    $verification = $client->verify->v2->services($verifyServiceSid)
                        ->verifications
                        ->create($request->phone_number, 'sms');

                    // Store verification SID for later verification
                    $existingUser->otp_code = $verification->sid;
                    $existingUser->otp_expires_at = now()->addMinutes(10);
                    $existingUser->save();

                    \Log::info('Twilio Verify OTP sent for login (via signup)', [
                        'verification_sid' => $verification->sid,
                        'phone_number' => $request->phone_number,
                        'status' => $verification->status,
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to send Twilio Verify OTP for login (via signup)', [
                        'error' => $e->getMessage(),
                        'phone_number' => $request->phone_number,
                    ]);
                    return response()->json(['message' => 'Failed to send OTP. Please try again.'], 500);
                }
            }
        } else {
            // New user - use signup OTP flow
            if ($isEmail) {
                // For email, use the existing notification system
                $otp = str_pad((string) rand(0, 999999), 6, '0', STR_PAD_LEFT);
                $cacheKey = 'signup_otp_' . md5($identifier);
                \Illuminate\Support\Facades\Cache::put($cacheKey, [
                    'otp' => Hash::make($otp),
                    'expires_at' => now()->addMinutes(10),
                    'identifier' => $identifier,
                    'is_email' => $isEmail,
                ], now()->addMinutes(10));

                $tempUser = new User();
                $tempUser->email = $request->email;
                $tempUser->notify(new OtpNotification($otp, true));
            } else {
                // For SMS, use Twilio Verify API
                try {
                    $accountSid = config('services.twilio.account_sid');
                    $authToken = config('services.twilio.auth_token');
                    $verifyServiceSid = config('services.twilio.verify_service_sid');

                    if (!$accountSid || !$authToken || !$verifyServiceSid) {
                        return response()->json(['message' => 'Twilio configuration is missing'], 500);
                    }

                    $client = new Client($accountSid, $authToken);
                    $verification = $client->verify->v2->services($verifyServiceSid)
                        ->verifications
                        ->create($request->phone_number, 'sms');

                    // Store verification SID in cache
                    $cacheKey = 'signup_otp_' . md5($identifier);
                    \Illuminate\Support\Facades\Cache::put($cacheKey, [
                        'verification_sid' => $verification->sid,
                        'expires_at' => now()->addMinutes(10),
                        'identifier' => $identifier,
                        'is_email' => $isEmail,
                    ], now()->addMinutes(10));

                    \Log::info('Twilio Verify OTP sent for signup', [
                        'verification_sid' => $verification->sid,
                        'phone_number' => $request->phone_number,
                        'status' => $verification->status,
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to send Twilio Verify OTP for signup', [
                        'error' => $e->getMessage(),
                        'phone_number' => $request->phone_number,
                    ]);
                    return response()->json(['message' => 'Failed to send OTP. Please try again.'], 500);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully',
            'identifier' => $identifier,
            'is_email' => $isEmail,
            'is_existing_user' => $isExistingUser,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/verify-signup-otp",
     *     operationId="verifySignupOtp",
     *     tags={"OTP"},
     *     summary="Verify OTP for signup",
     *     description="Verify OTP for new user registration. Must be called before /api/register",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"identifier", "otp"},
     *             @OA\Property(property="identifier", type="string", example="+923001234567", description="Email or phone number"),
     *             @OA\Property(property="otp", type="string", example="123456", description="6-digit OTP code")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OTP verified successfully. If user exists, they are logged in immediately.",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="OTP verified successfully"),
     *             @OA\Property(property="identifier", type="string", example="+923001234567"),
     *             @OA\Property(property="is_email", type="boolean", example=false),
     *             @OA\Property(property="is_existing_user", type="boolean", example=false, description="True if user already exists"),
     *             @OA\Property(property="token", type="string", example="1|xxx...", description="Authentication token (only if is_existing_user is true)"),
     *             @OA\Property(property="user", ref="#/components/schemas/User", description="User object (only if is_existing_user is true)")
     *         )
     *     ),
     *     @OA\Response(response=400, description="Invalid or expired OTP"),
     *     @OA\Response(response=500, description="Failed to verify OTP")
     * )
     * Verify OTP for signup. If user already exists, they are automatically logged in and token is returned.
     */
    public function verifySignupOtp(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        // Check if user exists (login flow)
        $user = User::where('email', $request->identifier)
            ->orWhere('phone_number', $request->identifier)
            ->first();

        if ($user) {
            // User exists - verify OTP using login flow
            $isEmail = !empty($user->email) && $user->email === $request->identifier;

            if ($isEmail) {
                // For email, use the existing verification
                if (!$user->otp_code || !$user->otp_expires_at || $user->otp_expires_at->isPast()) {
                    return response()->json(['message' => 'OTP has expired. Please request a new one.'], 400);
                }

                if (!Hash::check($request->otp, $user->otp_code)) {
                    return response()->json(['message' => 'Invalid OTP'], 400);
                }
            } else {
                // For SMS, use Twilio Verify API
                try {
                    $accountSid = config('services.twilio.account_sid');
                    $authToken = config('services.twilio.auth_token');
                    $verifyServiceSid = config('services.twilio.verify_service_sid');

                    if (!$accountSid || !$authToken || !$verifyServiceSid) {
                        return response()->json(['message' => 'Twilio configuration is missing'], 500);
                    }

                    // Check if verification was initiated
                    if (!$user->otp_code || !$user->otp_expires_at || $user->otp_expires_at->isPast()) {
                        return response()->json(['message' => 'OTP has expired. Please request a new one.'], 400);
                    }

                    $client = new Client($accountSid, $authToken);
                    $verificationCheck = $client->verify->v2->services($verifyServiceSid)
                        ->verificationChecks
                        ->create([
                            'to' => $request->identifier,
                            'code' => $request->otp
                        ]);

                    if ($verificationCheck->status !== 'approved') {
                        return response()->json(['message' => 'Invalid OTP'], 400);
                    }

                    \Log::info('Twilio Verify OTP verified for login (via signup)', [
                        'verification_sid' => $verificationCheck->sid,
                        'phone_number' => $request->identifier,
                        'status' => $verificationCheck->status,
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to verify Twilio Verify OTP for login (via signup)', [
                        'error' => $e->getMessage(),
                        'phone_number' => $request->identifier,
                    ]);
                    return response()->json(['message' => 'Failed to verify OTP. Please try again.'], 500);
                }
            }

            // Clear OTP
            $user->otp_code = null;
            $user->otp_expires_at = null;
            $user->is_verified = true;
            if (!$user->email_verified_at) {
                $user->email_verified_at = now();
            }
            $user->save();

            // Create token and log in
            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'OTP verified successfully. You are now logged in.',
                'identifier' => $request->identifier,
                'is_email' => $isEmail,
                'is_existing_user' => true,
                'token' => $token,
                'user' => new \App\Http\Resources\UserResource($user),
            ]);
        }

        // New user - verify OTP from cache (signup flow)
        $cacheKey = 'signup_otp_' . md5($request->identifier);
        $otpData = \Illuminate\Support\Facades\Cache::get($cacheKey);

        if (!$otpData) {
            return response()->json(['message' => 'OTP not found or expired'], 400);
        }

        if (now()->isAfter($otpData['expires_at'])) {
            \Illuminate\Support\Facades\Cache::forget($cacheKey);
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 400);
        }

        if ($otpData['is_email']) {
            // For email, verify using hashed OTP
            if (!Hash::check($request->otp, $otpData['otp'])) {
                return response()->json(['message' => 'Invalid OTP'], 400);
            }
        } else {
            // For SMS, use Twilio Verify API
            try {
                $accountSid = config('services.twilio.account_sid');
                $authToken = config('services.twilio.auth_token');
                $verifyServiceSid = config('services.twilio.verify_service_sid');

                if (!$accountSid || !$authToken || !$verifyServiceSid) {
                    return response()->json(['message' => 'Twilio configuration is missing'], 500);
                }

                $client = new Client($accountSid, $authToken);
                $verificationCheck = $client->verify->v2->services($verifyServiceSid)
                    ->verificationChecks
                    ->create([
                        'to' => $request->identifier,
                        'code' => $request->otp
                    ]);

                if ($verificationCheck->status !== 'approved') {
                    return response()->json(['message' => 'Invalid OTP'], 400);
                }

                \Log::info('Twilio Verify OTP verified for signup', [
                    'verification_sid' => $verificationCheck->sid,
                    'phone_number' => $request->identifier,
                    'status' => $verificationCheck->status,
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to verify Twilio Verify OTP for signup', [
                    'error' => $e->getMessage(),
                    'phone_number' => $request->identifier,
                ]);
                return response()->json(['message' => 'Failed to verify OTP. Please try again.'], 500);
            }
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
            'is_existing_user' => false,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/set-password",
     *     operationId="setPassword",
     *     tags={"OTP"},
     *     summary="Set password for user",
     *     description="Set or update password for a user (optional, can be done after OTP login)",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"identifier", "password"},
     *             @OA\Property(property="identifier", type="string", example="+923001234567", description="Email or phone number"),
     *             @OA\Property(property="password", type="string", format="password", example="password123", description="New password"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Password set successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Password set successfully")
     *         )
     *     ),
     *     @OA\Response(response=404, description="User not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
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
