<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CarType;

class CarTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $carTypes = [
            [
                'name' => 'sedan',
                'image' => '/images/car-types/sedan-car.png'
            ],
            [
                'name' => 'suv',
                'image' => '/images/car-types/suv-car.png'
            ],
            [
                'name' => 'hatchback',
                'image' => '/images/car-types/hatchback-car.png'
            ],
            [
                'name' => 'hybrid',
                'image' => '/images/car-types/hybrid-car.png'
            ],
        ];

        foreach ($carTypes as $carType) {
            CarType::firstOrCreate(
                ['name' => $carType['name']],
                $carType
            );
        }
    }
}
