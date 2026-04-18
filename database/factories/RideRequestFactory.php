<?php

namespace Database\Factories;

use App\Models\RideRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RideRequest>
 */
class RideRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->name(),
            'contact' => fake()->phoneNumber(),
            'start_location' => fake()->address(),
            'end_location' => fake()->address(),
            'departure_time' => fake()->dateTimeBetween('+1 day', '+2 weeks'),
            'schedule_type' => 'once',
            'selected_days' => null,
            'is_roundtrip' => false,
            'return_time' => null,
            'required_seats' => fake()->numberBetween(1, 4),
            'preferred_driver_gender' => fake()->randomElement(['male', 'female', 'any']),
            'budget_per_seat' => fake()->numberBetween(150, 1200),
            'currency' => 'PKR',
            'description' => fake()->sentence(),
            'is_active' => true,
            'is_system_generated' => false,
        ];
    }
}
