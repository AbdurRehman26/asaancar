<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CarOffer;
use App\Models\Car;

class CarOfferSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cars = Car::all();
        if ($cars->count() === 0) return;
        CarOffer::factory(25)->make()->each(function ($offer) use ($cars) {
            $offer->car_id = $cars->random()->id;
            $offer->save();
        });
    }
}
