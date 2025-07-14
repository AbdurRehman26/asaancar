<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class WebPushController extends Controller
{
    // Return the VAPID public key for frontend subscription
    public function publicKey()
    {
        return response(Config::get('webpush.vapid.public_key'));
    }

    // Store the push subscription for the authenticated user
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