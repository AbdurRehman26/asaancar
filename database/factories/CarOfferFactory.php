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
        $end = (clone $start)->modify('+'.rand(1, 14).' days');
        return [
            'car_id' => null, // to be set in seeder
            'price_with_driver' => $this->faker->randomFloat(2, 50, 200),
            'price_without_driver' => $this->faker->randomFloat(2, 30, 150),
            'start_date' => $start,
            'end_date' => $end,
            'available_from' => $start,
            'available_to' => $end,
        ];
    }
}
