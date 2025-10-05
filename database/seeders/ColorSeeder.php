<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Color;
use Illuminate\Support\Str;

class ColorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $colors = [
            ['name' => 'White', 'hex_code' => '#FFFFFF'],
            ['name' => 'Black', 'hex_code' => '#000000'],
            ['name' => 'Silver', 'hex_code' => '#C0C0C0'],
            ['name' => 'Gray', 'hex_code' => '#808080'],
            ['name' => 'Red', 'hex_code' => '#FF0000'],
            ['name' => 'Blue', 'hex_code' => '#0000FF'],
            ['name' => 'Green', 'hex_code' => '#008000'],
            ['name' => 'Yellow', 'hex_code' => '#FFFF00'],
            ['name' => 'Orange', 'hex_code' => '#FFA500'],
            ['name' => 'Brown', 'hex_code' => '#A52A2A'],
            ['name' => 'Purple', 'hex_code' => '#800080'],
            ['name' => 'Pink', 'hex_code' => '#FFC0CB'],
            ['name' => 'Gold', 'hex_code' => '#FFD700'],
            ['name' => 'Beige', 'hex_code' => '#F5F5DC'],
            ['name' => 'Navy Blue', 'hex_code' => '#000080'],
            ['name' => 'Maroon', 'hex_code' => '#800000'],
            ['name' => 'Teal', 'hex_code' => '#008080'],
            ['name' => 'Cream', 'hex_code' => '#FFFDD0'],
            ['name' => 'Champagne', 'hex_code' => '#F7E7CE'],
            ['name' => 'Pearl White', 'hex_code' => '#F8F8FF'],
            ['name' => 'Metallic Black', 'hex_code' => '#1C1C1C'],
            ['name' => 'Metallic Silver', 'hex_code' => '#B8B8B8'],
            ['name' => 'Metallic Blue', 'hex_code' => '#1E3A8A'],
            ['name' => 'Metallic Red', 'hex_code' => '#DC2626'],
            ['name' => 'Metallic Green', 'hex_code' => '#059669'],
        ];

        foreach ($colors as $colorData) {
            $existingColor = Color::where('name', $colorData['name'])->first();
            
            if (!$existingColor) {
                Color::create([
                    'name' => $colorData['name'],
                    'hex_code' => $colorData['hex_code'],
                    'slug' => Str::slug($colorData['name']),
                    'is_active' => true,
                ]);
                
                echo "Created color: {$colorData['name']}\n";
            } else {
                echo "Color already exists: {$colorData['name']}\n";
            }
        }
        
        echo "Color seeding completed!\n";
    }
}