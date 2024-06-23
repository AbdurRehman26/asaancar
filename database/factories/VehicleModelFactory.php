<?php

namespace Database\Factories;

use App\Models\VehicleMake;
use App\Models\VehicleType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VehicleModel>
 */
class VehicleModelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'vehicle_make_id' => VehicleMake::factory()->create(),
            'vehicle_type_id' => VehicleType::factory()->create()
        ];
    }
}
