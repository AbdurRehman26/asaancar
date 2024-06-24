<?php

namespace Database\Factories;

use App\Models\BookingStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BookingStatus>
 */
class BookingStatusFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(BookingStatus::STATUSES);

        return [
            'code' => $status,
            'name' => Str::of($status)->title()
        ];
    }
}
