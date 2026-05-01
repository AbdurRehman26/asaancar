<?php

namespace Database\Factories;

use App\Models\DriverLocation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DriverLocation>
 */
class DriverLocationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'driver_user_id' => User::factory(),
            'latitude' => '24.8607000',
            'longitude' => '67.0011000',
            'heading' => fake()->randomFloat(2, 0, 359),
            'speed' => fake()->randomFloat(2, 0, 80),
            'accuracy' => fake()->randomFloat(2, 1, 15),
            'recorded_at' => now(),
        ];
    }
}
