<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed roles and permissions
        $roles = ['admin', 'customer', 'user'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        // 2. Create specific user with admin role
        $specificUser = User::firstOrCreate(
            ['email' => 'sydabdrehman@gmail.com'],
            [
                'name' => 'Syed Abdul Rehman',
                'email' => 'sydabdrehman@gmail.com',
                'phone_number' => '+923202095051',
                'password' => bcrypt('sydabdrehman@gmail.com'),
                'email_verified_at' => now(),
            ]
        );
        // Update phone number if user already exists
        if ($specificUser->phone_number !== '+923202095051') {
            $specificUser->phone_number = '+923202095051';
            $specificUser->save();
        }
        $specificUser->assignRole('admin');

        $this->call([
            UserSeeder::class,
            CitySeeder::class,
            AreaSeeder::class,
            PickAndDropSeeder::class,
        ]);
    }
}
