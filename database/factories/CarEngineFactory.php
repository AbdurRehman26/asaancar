<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CarEngine>
 */
class CarEngineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $engines = ['V6', 'V8', 'I4', 'Electric', 'Hybrid'];
        return [
            'name' => $this->faker->unique()->randomElement($engines),
        ];
    }
}
