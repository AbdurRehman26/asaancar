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
        $specificUser->assignRole('store_owner');

        // 3. Seed car brands, types, engines
        $carBrands = \App\Models\CarBrand::factory(8)->create();
        $carTypes = \App\Models\CarType::factory(6)->create();
        $carEngines = \App\Models\CarEngine::factory(5)->create();

        // 4. Seed stores
        $stores = \App\Models\Store::factory(10)->create();

        // 5. Seed users and assign roles
        $storeOwners = \App\Models\User::factory(5)->create();
        $customers = \App\Models\User::factory(10)->create();
        $admins = \App\Models\User::factory(2)->create();

        foreach ($storeOwners as $user) {
            $user->assignRole('store_owner');
            // Attach each store owner to 1-3 random stores
            $user->stores()->attach($stores->random(rand(1,3))->pluck('id')->toArray());
        }
        foreach ($customers as $user) {
            $user->assignRole('customer');
        }
        foreach ($admins as $user) {
            $user->assignRole('admin');
        }

        // 6. Seed cars (linked to stores, brands, types, engines)
        $cars = collect();
        foreach ($stores as $store) {
            $cars = $cars->merge(\App\Models\Car::factory(8)->make()->each(function($car) use ($store, $carBrands, $carTypes, $carEngines) {
                $car->store_id = $store->id;
                $car->car_brand_id = $carBrands->random()->id;
                $car->car_type_id = $carTypes->random()->id;
                $car->car_engine_id = $carEngines->random()->id;
                $car->save();
            }));
        }

        // 7. Seed bookings (linked to users, cars, stores)
        $allUsers = $storeOwners->merge($customers);
        foreach ($cars as $car) {
            \App\Models\Booking::factory(3)->make()->each(function($booking) use ($allUsers, $car) {
                $booking->user_id = $allUsers->random()->id;
                $booking->car_id = $car->id;
                $booking->store_id = $car->store_id;
                $booking->save();
            });
        }

        // 8. Optionally seed car offers, store offers, etc.
        $this->call([
            CarOfferSeeder::class,
            StoreOfferSeeder::class,
            CitySeeder::class,
        ]);
    }
}
