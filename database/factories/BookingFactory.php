<?php

namespace Database\Factories;

use App\Models\BookingStatus;
use App\Models\RideOffer;
use App\Models\User;
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
        return [
            'user_id' => User::factory()->create(),
            'booking_status_id' => BookingStatus::factory()->create(),
            'ride_offer_id' => RideOffer::factory()->create(),
            'from_location' => fake()->streetAddress(),
            'to_location' => fake()->streetName(),
            'from_date_time' => fake()->dateTime(),
            'to_date_time' => fake()->dateTime()
        ];
    }
}
