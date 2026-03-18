<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PickAndDrop>
 */
class PickAndDropFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'name' => $this->faker->name,
            'contact' => $this->faker->phoneNumber,
            'start_location' => $this->faker->address,
            'end_location' => $this->faker->address,
            'pickup_city_id' => \App\Models\City::factory(),
            'pickup_area_id' => \App\Models\Area::factory(),
            'dropoff_city_id' => \App\Models\City::factory(),
            'dropoff_area_id' => \App\Models\Area::factory(),
            'available_spaces' => $this->faker->numberBetween(1, 4),
            'driver_gender' => $this->faker->randomElement(['male', 'female']),
            'departure_time' => $this->faker->dateTimeBetween('+1 day', '+1 week'),
            'price_per_person' => $this->faker->randomFloat(2, 100, 1000),
            'currency' => 'PKR',
            'is_active' => true,
        ];
    }
}
