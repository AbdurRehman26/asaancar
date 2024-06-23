<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\VehicleModel;
use App\Models\VehicleType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vehicle>
 */
class VehicleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vehicle_type_id' => VehicleType::factory()->create(),
            'vehicle_model_id' => VehicleModel::factory()->create(),
            'user_id' => User::factory()->create(),
            'color' => $this->faker->hexColor(),
            'number_plate' => $this->faker->swiftBicNumber(),
            'year_of_manufacture' => $this->faker->date()
        ];
    }
}
