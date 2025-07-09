<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Store;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $store = Store::create([
            'store_username' => 'teststore',
            'name' => 'Test Store',
            'description' => 'A store for testing.',
            'logo_url' => null,
            'city' => 'Test City',
            'contact_phone' => '1234567890',
            'address' => '123 Test St',
            'data' => [],
        ]);

        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        $user->stores()->attach($store->id);

        $this->call([
            CarSeeder::class,
            CarOfferSeeder::class,
            BookingSeeder::class,
        ]);
    }
}
