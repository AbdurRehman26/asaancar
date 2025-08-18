<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Car>
 */
class CarFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'store_id' => 1,
            'car_brand_id' => 1,
            'car_type_id' => 1,

            'model' => $this->faker->bothify('Model-###'),
            'year' => $this->faker->numberBetween(2015, 2024),
            'name' => $this->faker->company . ' ' . $this->faker->word,
            'color' => $this->faker->safeColorName(),
            'description' => $this->faker->sentence(),
            'image_urls' => [$this->faker->imageUrl(640, 480, 'cars', true)],
            'seats' => $this->faker->numberBetween(2, 8),
            'transmission' => $this->faker->randomElement(['manual', 'automatic']),
            'fuel_type' => $this->faker->randomElement(['petrol', 'diesel', 'electric', 'hybrid']),
            'available' => true,
        ];
    }
}
