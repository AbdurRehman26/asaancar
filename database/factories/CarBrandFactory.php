<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CarBrand>
 */
class CarBrandFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $brands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Audi', 'Kia', 'Hyundai', 'Chevrolet'];
        return [
            'name' => $this->faker->unique()->randomElement($brands),
        ];
    }
}
