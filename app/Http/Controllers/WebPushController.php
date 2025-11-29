<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Tag(
 *     name="WebPush",
 *     description="API Endpoints for web push notifications"
 * )
 */
class WebPushController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/webpush/public-key",
     *     operationId="getWebPushPublicKey",
     *     tags={"WebPush"},
     *     summary="Get VAPID public key",
     *     description="Get the VAPID public key for web push notification subscription",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="public_key", type="string", example="BEl62iUYgUivxIkv69yViEuiBIa40HI...")
     *         )
     *     )
     * )
     * Return the VAPID public key for frontend subscription
     */
    public function publicKey()
    {
        return response(Config::get('webpush.vapid.public_key'));
    }

    /**
     * @OA\Post(
     *     path="/api/webpush/subscribe",
     *     operationId="subscribeWebPush",
     *     tags={"WebPush"},
     *     summary="Subscribe to web push notifications",
     *     description="Store the push subscription for the authenticated user",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"subscription"},
     *             @OA\Property(property="subscription", type="object", description="Push subscription object from browser")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Subscription stored successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     * Store the push subscription for the authenticated user
     */
    public function subscribe(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $subscription = $request->input('subscription');
        if (!$subscription) {
            return response()->json(['error' => 'No subscription provided'], 422);
        }
        $user->updatePushSubscription($subscription);
        return response()->json(['success' => true]);
    }
} 