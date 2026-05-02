<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserFcmToken;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserFcmToken>
 */
class UserFcmTokenFactory extends Factory
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
            'token' => fake()->unique()->sha256(),
            'device_name' => fake()->randomElement(['Samsung Galaxy', 'Google Pixel', 'iPhone']),
            'platform' => fake()->randomElement(['android', 'ios']),
            'app_version' => fake()->randomElement(['1.0.0', '1.1.0', '2.0.0']),
            'last_used_at' => now(),
        ];
    }
}
