<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CarType>
 */
class CarTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['sedan', 'suv', 'hatchback', 'convertible', 'truck', 'coupe'];
        return [
            'name' => $this->faker->unique()->randomElement($types),
        ];
    }
}
