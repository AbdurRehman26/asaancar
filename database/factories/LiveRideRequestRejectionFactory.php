<?php

namespace Database\Factories;

use App\Models\LiveRideRequest;
use App\Models\LiveRideRequestRejection;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LiveRideRequestRejection>
 */
class LiveRideRequestRejectionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'live_ride_request_id' => LiveRideRequest::factory(),
            'driver_user_id' => User::factory(),
            'rejected_at' => now(),
        ];
    }
}
