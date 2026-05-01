<?php

namespace App\Policies;

use App\Models\LiveRideRequest;
use App\Models\User;

class LiveRideRequestPolicy
{
    public function view(User $user, LiveRideRequest $liveRideRequest): bool
    {
        return $liveRideRequest->rider_user_id === $user->id || $liveRideRequest->driver_user_id === $user->id;
    }

    public function cancelByRider(User $user, LiveRideRequest $liveRideRequest): bool
    {
        return $liveRideRequest->rider_user_id === $user->id;
    }

    public function manageAsDriver(User $user, LiveRideRequest $liveRideRequest): bool
    {
        return $liveRideRequest->driver_user_id === $user->id;
    }
}
