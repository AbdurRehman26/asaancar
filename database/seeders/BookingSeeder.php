<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\User;
use App\Models\Car;
use App\Models\Store;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $cars = Car::all();
        $stores = Store::all();
        if ($users->count() === 0 || $cars->count() === 0 || $stores->count() === 0) return;
        Booking::factory(25)->make()->each(function ($booking) use ($users, $cars, $stores) {
            $booking->user_id = $users->random()->id;
            $car = $cars->random();
            $booking->car_id = $car->id;
            $booking->store_id = $car->store_id;
            $booking->save();
        });
    }
}
