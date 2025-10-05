<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Year;

class YearSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currentYear = date('Y');
        $startYear = $currentYear - 30; // Go back 30 years from current year
        
        echo "Creating years from {$startYear} to {$currentYear}...\n";
        
        for ($year = $currentYear; $year >= $startYear; $year--) {
            $existingYear = Year::where('year', $year)->first();
            
            if (!$existingYear) {
                Year::create([
                    'year' => $year,
                    'is_active' => true,
                ]);
                
                echo "Created year: {$year}\n";
            } else {
                echo "Year already exists: {$year}\n";
            }
        }
        
        echo "Year seeding completed! Total years: " . Year::count() . "\n";
    }
}