<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserVehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserVehicle>
 */
class UserVehicleFactory extends Factory
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
            'vehicle_type' => fake()->randomElement(['car', 'bike']),
            'brand' => fake()->randomElement(['Toyota', 'Honda', 'Suzuki', 'Yamaha', 'United']),
            'model' => fake()->randomElement(['Corolla', 'Civic', 'Cultus', 'YBR', 'CD 70']),
            'color' => fake()->safeColorName(),
            'seats' => fake()->numberBetween(1, 7),
            'transmission' => fake()->randomElement(['manual', 'automatic']),
            'fuel_type' => fake()->randomElement(['petrol', 'diesel', 'electric', 'hybrid']),
            'is_default' => false,
        ];
    }
}
