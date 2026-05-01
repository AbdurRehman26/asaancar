<?php

namespace Database\Factories;

use App\Models\LiveRideRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LiveRideRequest>
 */
class LiveRideRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'rider_user_id' => User::factory(),
            'driver_user_id' => null,
            'status' => LiveRideRequest::STATUS_SEARCHING,
            'pickup_place_id' => fake()->optional()->regexify('[A-Za-z0-9_-]{20}'),
            'pickup_location' => fake()->address(),
            'pickup_latitude' => '24.8607000',
            'pickup_longitude' => '67.0011000',
            'dropoff_place_id' => fake()->optional()->regexify('[A-Za-z0-9_-]{20}'),
            'dropoff_location' => fake()->address(),
            'dropoff_latitude' => '24.9200000',
            'dropoff_longitude' => '67.1200000',
            'vehicle_type' => fake()->randomElement(['bike', 'mini', 'go', 'xl']),
            'estimated_fare' => fake()->randomFloat(2, 250, 1800),
            'final_fare' => null,
            'distance_km' => fake()->randomFloat(2, 2, 30),
            'eta_minutes' => fake()->numberBetween(5, 40),
            'currency' => 'PKR',
            'requested_at' => now(),
            'accepted_at' => null,
            'arrived_at' => null,
            'started_at' => null,
            'completed_at' => null,
            'cancelled_at' => null,
            'cancelled_by' => null,
            'cancellation_reason' => null,
        ];
    }
}
