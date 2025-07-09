<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
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
            'user_id' => null, // to be set in seeder
            'car_id' => null, // to be set in seeder
            'store_id' => null, // to be set in seeder
            'start_date' => $start,
            'end_date' => $end,
            'total_price' => $this->faker->randomFloat(2, 100, 2000),
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'cancelled', 'completed']),
            'notes' => $this->faker->optional()->sentence(),
            'pickup_location' => $this->faker->streetAddress(),
            'dropoff_location' => $this->faker->streetAddress(),
        ];
    }
}
