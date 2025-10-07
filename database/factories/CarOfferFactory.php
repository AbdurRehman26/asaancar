<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CarOffer>
 */
class CarOfferFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-1 month', '+1 month');
        $end = (clone $start)->modify('+'.rand(1, 14).'days');
        return [
            'car_id' => null, // to be set in seeder
            'discount_percentage' => $this->faker->randomFloat(2, 5, 50),
            'currency' => 'PKR',
            'start_date' => $start,
            'end_date' => $end,
            'is_active' => $this->faker->boolean(80), // 80% chance of being active
        ];
    }
}
