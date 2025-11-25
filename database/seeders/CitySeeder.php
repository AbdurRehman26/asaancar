<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;
use Illuminate\Support\Facades\File;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data/cities.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->warn("Cities JSON file not found at: {$jsonPath}");
            return;
        }

        $citiesData = json_decode(File::get($jsonPath), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error("Failed to parse cities JSON: " . json_last_error_msg());
            return;
        }

        $this->command->info("Seeding " . count($citiesData) . " cities...");

        foreach ($citiesData as $cityData) {
            City::firstOrCreate(
                ['name' => $cityData['name']],
                ['name' => $cityData['name']]
            );
        }

        $this->command->info("Cities seeded successfully!");
    }
} 