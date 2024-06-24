<?php

namespace Database\Factories;

use App\Models\RideOffer;
use App\Models\RideOfferDetail;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RideOfferDetail>
 */
class RideOfferDetailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ride_offer_id' => RideOffer::factory()->create(),
            'duration_for' => RideOfferDetail::DURATION_FOR[array_rand(RideOfferDetail::DURATION_FOR)],
            'with_driver' => fake()->boolean(),
            'price' => fake()->randomDigitNotNull()
        ];
    }
}
