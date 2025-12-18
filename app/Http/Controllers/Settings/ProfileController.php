<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Settings",
 *     description="API Endpoints for user settings"
 * )
 */
class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request)
    {
        return response()->json([
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'user' => $request->user(),
        ]);
    }

    /**
     * @OA\Patch(
     *     path="/api/settings/profile",
     *     operationId="updateProfile",
     *     tags={"Settings"},
     *     summary="Update user profile",
     *     description="Update the authenticated user's profile information",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com", nullable=true),
     *             @OA\Property(property="profile_image", type="string", nullable=true, example="https://example.com/image.jpg")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Profile updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="user", ref="#/components/schemas/User")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();
        $emailChanged = isset($data['email']) && $data['email'] !== $user->email;
        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'] ?? $user->email,
            'profile_image' => $data['profile_image'] ?? $user->profile_image,
        ]);
        if ($emailChanged) {
            $user->email_verified_at = null;
        }
        $user->save();
        return response()->json(['user' => $user]);
    }

    /**
     * @OA\Delete(
     *     path="/api/settings/profile",
     *     operationId="deleteProfile",
     *     tags={"Settings"},
     *     summary="Delete user account",
     *     description="Delete the authenticated user's account",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"password"},
     *             @OA\Property(property="password", type="string", format="password", example="currentpassword")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Account deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     * Delete the user's account.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);
        $user = $request->user();
        // For API: delete the current access token (Sanctum)
        if ($request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }
        $user->delete();
        return response()->json(['success' => true]);
    }
}
