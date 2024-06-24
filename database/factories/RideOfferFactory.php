<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RideOffer>
 */
class RideOfferFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $vehicle = Vehicle::factory()->create();

        return [
            'vehicle_id' => $vehicle->id,
            'user_id' => $vehicle->user_id,
            'city_id' => City::forKarachi()->first()->id
        ];
    }
}
