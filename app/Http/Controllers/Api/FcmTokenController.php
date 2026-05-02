<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeleteFcmTokenRequest;
use App\Http\Requests\StoreFcmTokenRequest;
use App\Models\UserFcmToken;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(
 *     name="FCM",
 *     description="Firebase Cloud Messaging device token endpoints"
 * )
 */
class FcmTokenController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/fcm/tokens",
     *     operationId="storeFcmToken",
     *     tags={"FCM"},
     *     summary="Register or update an FCM device token",
     *     description="Stores the authenticated user's FCM device token for push notifications.",
     *     security={{"sanctum": {}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"token"},
     *
     *             @OA\Property(property="token", type="string", example="fcm_device_token_here"),
     *             @OA\Property(property="device_name", type="string", nullable=true, example="Samsung Galaxy S24"),
     *             @OA\Property(property="platform", type="string", enum={"android", "ios", "web"}, nullable=true, example="android"),
     *             @OA\Property(property="app_version", type="string", nullable=true, example="1.0.0")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="FCM token saved successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="token", type="string", example="fcm_device_token_here"),
     *                 @OA\Property(property="device_name", type="string", nullable=true, example="Samsung Galaxy S24"),
     *                 @OA\Property(property="platform", type="string", nullable=true, example="android"),
     *                 @OA\Property(property="app_version", type="string", nullable=true, example="1.0.0")
     *             ),
     *             @OA\Property(property="message", type="string", example="FCM token saved successfully.")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreFcmTokenRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $token = UserFcmToken::query()->updateOrCreate(
            ['token' => $validated['token']],
            [
                'user_id' => (int) $request->user()->id,
                'device_name' => $validated['device_name'] ?? null,
                'platform' => $validated['platform'] ?? null,
                'app_version' => $validated['app_version'] ?? null,
                'last_used_at' => now(),
            ],
        );

        return response()->json([
            'data' => [
                'id' => $token->id,
                'token' => $token->token,
                'device_name' => $token->device_name,
                'platform' => $token->platform,
                'app_version' => $token->app_version,
            ],
            'message' => 'FCM token saved successfully.',
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/fcm/tokens",
     *     operationId="deleteFcmToken",
     *     tags={"FCM"},
     *     summary="Delete an FCM device token",
     *     description="Deletes the authenticated user's stored FCM device token.",
     *     security={{"sanctum": {}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"token"},
     *
     *             @OA\Property(property="token", type="string", example="fcm_device_token_here")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="FCM token removed successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="FCM token removed successfully.")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function destroy(DeleteFcmTokenRequest $request): JsonResponse
    {
        UserFcmToken::query()
            ->where('user_id', $request->user()->id)
            ->where('token', $request->validated()['token'])
            ->delete();

        return response()->json([
            'message' => 'FCM token removed successfully.',
        ]);
    }
}
