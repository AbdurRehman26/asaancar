<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CarBrand;
use App\Models\CarModel;

class CarModelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brandModels = [
            "Suzuki" => [
                "Alto",
                "WagonR",
                "Cultus",
                "Karwan",      // locally available Suzuki Carry Karwan
            ],
            "Toyota" => [
                "Corolla",
                "Corolla X",
                "XCorolla",
                "Yaris",
                "Revo",
                "Rocco",
                "Fortuner",
                "GR",
                "Land Cruiser",
                "Land Cruiser V8",
                "Land Cruiser Prado",
            ],
            "Honda" => [
                "Civic",
                "Civic X",
                "Civic RS",
                "Honda BR-V",
            ],
            "Kia" => [
                "Sportage",
            ],
            "Hyundai" => [
                "Tucson",
            ],
            "Daihatsu" => [
                "Mira",
                "Hijet",
            ],
            "Mercedes" => [
                "Mercedes",
                "Mercedes Benz AMG C200",
                "Mercedes Benz AMG C180",
            ],
            "Audi" => [
                "Audi",
                "A4",
                "A5",
                "A6",
            ],
            "GMC" => [
                "GMC",
            ],
            "Other" => [
                "Limousine",
            ],
        ];

        foreach ($brandModels as $brandName => $models) {
            // Find or create the brand
            $brand = CarBrand::firstOrCreate(
                ['name' => $brandName],
                ['name' => $brandName]
            );

            echo "Processing brand: {$brandName} (ID: {$brand->id})\n";

            // Add models for this brand
            foreach ($models as $modelName) {
                // Check if model already exists for this brand
                $existingModel = CarModel::where('car_brand_id', $brand->id)
                    ->where('name', $modelName)
                    ->first();

                if (!$existingModel) {
                    // Create unique slug by appending brand name if needed
                    $baseSlug = \Illuminate\Support\Str::slug($modelName);
                    $slug = $baseSlug;
                    $counter = 1;

                    // Check if slug already exists
                    while (CarModel::where('slug', $slug)->exists()) {
                        $slug = $baseSlug . '-' . \Illuminate\Support\Str::slug($brandName);
                        break; // Use brand name to make it unique
                    }

                    CarModel::create([
                        'car_brand_id' => $brand->id,
                        'name' => $modelName,
                        'slug' => $slug,
                    ]);

                    echo "  Created model: {$modelName} (slug: {$slug})\n";
                } else {
                    echo "  Model already exists: {$modelName}\n";
                }
            }
        }

        echo "Car models seeding completed!\n";
    }
}
