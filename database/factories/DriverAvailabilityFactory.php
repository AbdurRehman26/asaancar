<?php

namespace Database\Factories;

use App\Models\DriverAvailability;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DriverAvailability>
 */
class DriverAvailabilityFactory extends Factory
{
    public function definition(): array
    {
        return [
            'driver_user_id' => User::factory(),
            'is_online' => true,
            'is_available' => true,
            'vehicle_type' => fake()->randomElement(['bike', 'mini', 'go', 'xl']),
            'last_seen_at' => now(),
        ];
    }
}
