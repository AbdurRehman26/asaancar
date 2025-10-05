<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CarBrand>
 */
class CarBrandFactory extends Factory
{
    public function definition(): array
    {
        $brands = ['Toyota', 'Honda', 'Suzuki', 'Nissan', 'Daihatsu', 'Changan', 'Kia', 'Hyundai', 'BMW', 'Mercedes', 'Audi'];
        return [
            'name' => $this->faker->unique()->randomElement($brands),
        ];
    }
}
