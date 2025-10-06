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
                "Yaris",
                "Revo",
                "Rocco",
                "Fortuner",
                "GR",
                "Land Cruiser",
            ],
            "Honda" => [
                "Civic",
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
            ],
            "Audi" => [
                "A4",
                "A5",
                "A6",
            ],
            "GMC" => [
                "GMC",
            ],
            "BMW" => [
                "BMW",
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

                    // Check for existing image
                    $imagePath = $this->findModelImage($modelName);

                    CarModel::create([
                        'car_brand_id' => $brand->id,
                        'name' => $modelName,
                        'slug' => $slug,
                        'image' => $imagePath,
                    ]);

                    echo "  Created model: {$modelName} (slug: {$slug})" . ($imagePath ? " [Image: {$imagePath}]" : "") . "\n";
                } else {
                    // Update existing model with image if it doesn't have one
                    if (!$existingModel->image) {
                        $imagePath = $this->findModelImage($modelName);
                        if ($imagePath) {
                            $existingModel->update(['image' => $imagePath]);
                            echo "  Updated model: {$modelName} [Added Image: {$imagePath}]\n";
                        } else {
                            echo "  Model already exists: {$modelName}\n";
                        }
                    } else {
                        echo "  Model already exists: {$modelName}\n";
                    }
                }
            }
        }

        echo "Car models seeding completed!\n";
    }

    /**
     * Find image for car model by checking similar names in public/images/car-models/
     */
    private function findModelImage(string $modelName): ?string
    {
        $imageDir = public_path('images/car-models');

        if (!is_dir($imageDir)) {
            return null;
        }

        // Convert model name to various possible file names
        $possibleNames = [
            strtolower($modelName),
            \Illuminate\Support\Str::slug($modelName),
            \Illuminate\Support\Str::slug($modelName, '-'),
            str_replace(' ', '-', strtolower($modelName)),
            str_replace(' ', '_', strtolower($modelName)),
        ];

        // Add some specific mappings for known models
        $specificMappings = [
            'Honda BR-V' => 'honda-brv',
            'Land Cruiser' => 'land-cruiser',
            'WagonR' => 'wagon-r',
            'Corolla X' => 'corolla-x',
            'XCorolla' => 'corolla-x',
            'A4' => 'audi',
            'A5' => 'audi',
            'A6' => 'audi',
        ];

        if (isset($specificMappings[$modelName])) {
            $possibleNames[] = $specificMappings[$modelName];
        }

        // Check for each possible name with different extensions
        $extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

        foreach ($possibleNames as $name) {
            foreach ($extensions as $ext) {
                $filename = "{$name}.{$ext}";
                $filepath = $imageDir . '/' . $filename;

                if (file_exists($filepath)) {
                    return "images/car-models/{$filename}";
                }
            }
        }

        return null;
    }
}
