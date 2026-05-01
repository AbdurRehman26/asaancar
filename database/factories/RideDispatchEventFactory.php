<?php

namespace Database\Factories;

use App\Models\LiveRideRequest;
use App\Models\RideDispatchEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RideDispatchEvent>
 */
class RideDispatchEventFactory extends Factory
{
    public function definition(): array
    {
        return [
            'live_ride_request_id' => LiveRideRequest::factory(),
            'event_type' => fake()->randomElement(['request_created', 'request_broadcasted', 'driver_accepted']),
            'actor_user_id' => User::factory(),
            'payload' => ['note' => fake()->sentence()],
            'occurred_at' => now(),
        ];
    }
}
