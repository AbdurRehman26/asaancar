<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Car;
use App\Models\Store;
use App\Models\CarModel;
use App\Models\CarBrand;
use App\Models\CarType;
use App\Models\CarEngine;

class CarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stores = Store::all();
        if ($stores->count() === 0) return;
        $carBrands = CarBrand::factory(8)->create();
        $carTypes = CarType::factory(6)->create();
        $carEngines = CarEngine::factory(5)->create();
        Car::factory(25)->make()->each(function ($car) use ($stores, $carBrands, $carTypes, $carEngines) {
            $car->store_id = $stores->random()->id;
            $car->car_brand_id = $carBrands->random()->id;
            $car->car_type_id = $carTypes->random()->id;
            $car->car_engine_id = $carEngines->random()->id;
            $car->save();
        });
    }
}
