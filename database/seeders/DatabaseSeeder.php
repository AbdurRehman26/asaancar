<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Store;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed roles and permissions
        $roles = ['admin', 'store_owner', 'customer', 'user'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        // 2. Create specific user with store owner role
        $specificUser = User::firstOrCreate(
            ['email' => 'sydabdrehman@gmail.com'],
            [
                'name' => 'Syed Abdul Rehman',
                'email' => 'sydabdrehman@gmail.com',
                'password' => bcrypt('sydabdrehman@gmail.com'),
                'email_verified_at' => now(),
            ]
        );
        $specificUser->assignRole('admin');

        // 3. Seed car brands, types, engines
        $carBrands = \App\Models\CarBrand::factory(10)->create();


        // 8. Optionally seed car offers, store offers, etc.
        $this->call([
            CarTypeSeeder::class,
            CarModelSeeder::class,
            ColorSeeder::class,
            YearSeeder::class,
            StoreSeeder::class,
            CarOfferSeeder::class,
            StoreOfferSeeder::class,
            CitySeeder::class,
        ]);
    }
}
