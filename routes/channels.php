<?php

use App\Models\LiveRideRequest;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{conversationId}', function ($user) {
    return true;
}, ['guards' => ['web', 'sanctum']]);

Broadcast::channel('user.{userId}', function ($user, int $userId) {
    return $user->id === $userId;
}, ['guards' => ['web', 'sanctum']]);

Broadcast::channel('driver.{driverUserId}', function ($user, int $driverUserId) {
    return $user->id === $driverUserId;
}, ['guards' => ['web', 'sanctum']]);

Broadcast::channel('live-ride.{rideId}', function ($user, int $rideId) {
    $liveRideRequest = LiveRideRequest::query()->find($rideId);

    if (! $liveRideRequest) {
        return false;
    }

    return in_array($user->id, [$liveRideRequest->rider_user_id, $liveRideRequest->driver_user_id], true);
}, ['guards' => ['web', 'sanctum']]);
