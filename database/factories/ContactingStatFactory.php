<?php

namespace Database\Factories;

use App\Models\ContactingStat;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContactingStat>
 */
class ContactingStatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'recipient_user_id' => User::factory(),
            'contactable_type' => $this->faker->randomElement(['pick_and_drop', 'ride_request']),
            'contactable_id' => $this->faker->numberBetween(1, 1000),
            'contact_method' => $this->faker->randomElement(['call', 'whatsapp', 'chat']),
            'interaction_count' => $this->faker->numberBetween(1, 10),
        ];
    }
}
