<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

/**
 * @OA\Tag(
 *     name="Settings",
 *     description="API Endpoints for user settings"
 * )
 */
class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    /**
     * @OA\Put(
     *     path="/api/settings/password",
     *     operationId="updatePassword",
     *     tags={"Settings"},
     *     summary="Update user password",
     *     description="Update the authenticated user's password. Current password is required only if user has a password set.",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"password"},
     *             @OA\Property(property="current_password", type="string", format="password", example="oldpassword", nullable=true, description="Required only if user has a password"),
     *             @OA\Property(property="password", type="string", format="password", example="newpassword123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="newpassword123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Password updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Password updated successfully.")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     * Update the user's password.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        // If user has a password, require current_password validation
        // If user doesn't have a password (OTP user), current_password is optional
        $rules = [
            'password' => ['required', Password::defaults(), 'confirmed'],
        ];

        if ($user->password) {
            // User has a password, so current_password is required
            $rules['current_password'] = ['required', 'current_password'];
        } else {
            // User doesn't have a password, current_password is optional
            $rules['current_password'] = ['nullable'];
        }

        $validated = $request->validate($rules);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
