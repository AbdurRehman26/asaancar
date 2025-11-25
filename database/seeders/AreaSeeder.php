<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Area;
use App\Models\City;
use Illuminate\Support\Facades\File;

class AreaSeeder extends Seeder
{
    public function run(): void
    {
        // Seed Karachi areas
        $karachiJsonPath = database_path('data/locations/areas/karachi_locations.json');
        
        if (File::exists($karachiJsonPath)) {
            $this->seedKarachiAreas($karachiJsonPath);
        } else {
            $this->command->warn("Karachi locations JSON file not found at: {$karachiJsonPath}");
        }

        // Add more cities' areas here as needed
        // Example: if (File::exists(database_path('data/locations/areas/lahore_locations.json'))) { ... }
    }

    private function seedKarachiAreas(string $jsonPath): void
    {
        $areasData = json_decode(File::get($jsonPath), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error("Failed to parse Karachi locations JSON: " . json_last_error_msg());
            return;
        }

        $karachi = City::where('name', 'Karachi')->first();

        if (!$karachi) {
            $this->command->error("Karachi city not found. Please run CitySeeder first.");
            return;
        }

        $this->command->info("Seeding " . count($areasData) . " areas for Karachi...");

        foreach ($areasData as $areaData) {
            $slug = \Illuminate\Support\Str::slug($areaData['name']);
            
            Area::firstOrCreate(
                [
                    'city_id' => $karachi->id,
                    'name' => $areaData['name'],
                ],
                [
                    'city_id' => $karachi->id,
                    'name' => $areaData['name'],
                    'slug' => $slug,
                    'is_active' => true,
                ]
            );
        }

        $this->command->info("Karachi areas seeded successfully!");
    }
}


