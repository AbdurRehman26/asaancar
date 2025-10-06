<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Car;
use App\Models\CarOffer;
use App\Models\Store;
use App\Models\CarBrand;
use App\Models\CarModel;
use App\Models\CarType;

class CarImportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "Starting car import seeding...\n";

        // Car data with pricing
        $carsData = [
            [
                'name' => 'Corolla',
                'model' => 'Corolla',
                'year' => 2020,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Toyota',
                'model_name' => 'Corolla',
                'type_name' => 'Sedan',
                'with_driver_rate' => 5000,
            ],
            [
                'name' => 'Civic',
                'model' => 'Civic',
                'year' => 2020,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Honda',
                'model_name' => 'Civic',
                'type_name' => 'Sedan',
                'with_driver_rate' => 8000,
            ],
            [
                'name' => 'Fortuner',
                'model' => 'Fortuner',
                'year' => 2020,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Toyota',
                'model_name' => 'Fortuner',
                'type_name' => 'SUV',
                'with_driver_rate' => 13000,
            ],
            [
                'name' => 'Rivo',
                'model' => 'Rivo',
                'year' => 2020,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Toyota',
                'model_name' => 'Revo',
                'type_name' => 'SUV',
                'with_driver_rate' => 10000,
            ],
            [
                'name' => 'BRV',
                'model' => 'BRV',
                'year' => 2020,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Honda',
                'model_name' => 'Honda BR-V',
                'type_name' => 'SUV',
                'with_driver_rate' => 8000,
            ],
            [
                'name' => 'BMW',
                'model' => 'BMW',
                'year' => 2019,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Other',
                'model_name' => 'BMW',
                'type_name' => 'Sedan',
                'with_driver_rate' => 40000,
            ],
            [
                'name' => 'Audi A3',
                'model' => 'Audi A3',
                'year' => 2019,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Audi',
                'model_name' => 'A3',
                'type_name' => 'Sedan',
                'with_driver_rate' => 20000,
            ],
            [
                'name' => 'Audi A4',
                'model' => 'Audi A4',
                'year' => 2017,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Audi',
                'model_name' => 'A4',
                'type_name' => 'Sedan',
                'with_driver_rate' => 25000,
            ],
            [
                'name' => 'Audi A5',
                'model' => 'Audi A5',
                'year' => 2017,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Audi',
                'model_name' => 'A5',
                'type_name' => 'Sedan',
                'with_driver_rate' => 35000,
            ],
            [
                'name' => 'Audi A6',
                'model' => 'Audi A6',
                'year' => 2021,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Audi',
                'model_name' => 'A6',
                'type_name' => 'Sedan',
                'with_driver_rate' => 50000,
            ],
            [
                'name' => 'Mercedes Benz AMG C200',
                'model' => 'Mercedes Benz AMG C200',
                'year' => 2018,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Mercedes',
                'model_name' => 'Mercedes',
                'type_name' => 'Sedan',
                'with_driver_rate' => 30000,
            ],
            [
                'name' => 'Mercedes Benz AMG C180',
                'model' => 'Mercedes Benz AMG C180',
                'year' => 2018,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Mercedes',
                'model_name' => 'Mercedes',
                'type_name' => 'Sedan',
                'with_driver_rate' => 30000,
            ],
            [
                'name' => 'Corolla X',
                'model' => 'Corolla X',
                'year' => 2020,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Toyota',
                'model_name' => 'Corolla X',
                'type_name' => 'Sedan',
                'with_driver_rate' => 5000,
            ],
            [
                'name' => 'Civic RS',
                'model' => 'Civic RS',
                'year' => 2021,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Honda',
                'model_name' => 'Civic RS',
                'type_name' => 'Sedan',
                'with_driver_rate' => 13000,
            ],
            [
                'name' => 'Revo',
                'model' => 'Revo',
                'year' => 2020,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Toyota',
                'model_name' => 'Revo',
                'type_name' => 'SUV',
                'with_driver_rate' => 10000,
            ],
            [
                'name' => 'Civic X',
                'model' => 'Civic X',
                'year' => 2021,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Honda',
                'model_name' => 'Civic X',
                'type_name' => 'Sedan',
                'with_driver_rate' => 8000,
            ],
            [
                'name' => 'Land Cruiser Prado V8',
                'model' => 'Land Cruiser Prado V8',
                'year' => 2021,
                'color' => 'N/A',
                'seats' => 4,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Toyota',
                'model_name' => 'Land Cruiser',
                'type_name' => 'SUV',
                'with_driver_rate' => 25000,
            ],
            [
                'name' => 'Karwan Hijet BRV 7 SeaterS',
                'model' => 'Karwan Hijet BRV 7 SeaterS',
                'year' => 2020,
                'color' => 'N/A',
                'seats' => 6,
                'transmission' => 'Automatic',
                'fuel_type' => 'Petrol',
                'brand_name' => 'Suzuki',
                'model_name' => 'Karwan',
                'type_name' => 'SUV',
                'with_driver_rate' => 8000,
            ],
        ];

        // Get the store (assuming store ID 6 is Sufiyan Car Deal)
        $store = Store::find(6);
        if (!$store) {
            echo "Store with ID 6 not found. Please check the store exists.\n";
            return;
        }

        echo "Using store: {$store->name} (ID: {$store->id})\n";

        foreach ($carsData as $carData) {
            // Find or create brand
            $brand = CarBrand::firstOrCreate(
                ['name' => $carData['brand_name']],
                ['name' => $carData['brand_name']]
            );

            // Find or create model with unique slug handling
            $existingModel = CarModel::where('car_brand_id', $brand->id)
                ->where('name', $carData['model_name'])
                ->first();

            if (!$existingModel) {
                $baseSlug = \Illuminate\Support\Str::slug($carData['model_name']);
                $slug = $baseSlug;
                $counter = 1;

                // Check if slug already exists
                while (CarModel::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }

                $model = CarModel::create([
                    'car_brand_id' => $brand->id,
                    'name' => $carData['model_name'],
                    'slug' => $slug,
                ]);
            } else {
                $model = $existingModel;
            }

            // Find or create car type
            $carType = CarType::firstOrCreate(
                ['name' => $carData['type_name']],
                ['name' => $carData['type_name']]
            );

            // Check if car already exists
            $existingCar = Car::where('store_id', $store->id)
                ->where('name', $carData['name'])
                ->where('model', $carData['model'])
                ->first();

            if (!$existingCar) {
                // Create the car
                $car = Car::create([
                    'store_id' => $store->id,
                    'car_brand_id' => $brand->id,
                    'car_model_id' => $model->id,
                    'car_type_id' => $carType->id,
                    'model' => $carData['model'],
                    'year' => $carData['year'],
                    'name' => $carData['name'],
                    'color' => $carData['color'],
                    'description' => null,
                    'image_urls' => null,
                    'seats' => $carData['seats'],
                    'transmission' => $carData['transmission'],
                    'fuel_type' => $carData['fuel_type'],
                ]);

                // Create car offer with driver rate
                CarOffer::create([
                    'car_id' => $car->id,
                    'price_with_driver' => $carData['with_driver_rate'],
                    'price_without_driver' => null,
                    'available_from' => now(),
                    'available_to' => now()->addYear(),
                    'is_active' => true,
                    'start_date' => null,
                    'end_date' => null,
                ]);

                echo "Created car: {$carData['name']} ({$brand->name} {$model->name}) - Rate: {$carData['with_driver_rate']}\n";
            } else {
                echo "Car already exists: {$carData['name']}\n";
            }
        }

        echo "Car import seeding completed!\n";
    }
}