<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Store>
 */
class StoreFactory extends Factory
{
    public function definition(): array
    {
        return [
            'store_username' => $this->faker->unique()->userName(),
            'name' => $this->faker->unique()->company(),
            'description' => $this->faker->sentence(),
            'logo_url' => $this->faker->imageUrl(200, 200, 'business'),
            'contact_phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            // 'data' => $this->faker->randomElement([null, ['foo' => 'bar']]),
        ];
    }
}
