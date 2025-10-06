<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "Creating users with fixed IDs...\n";

        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Define users with fixed IDs
        $users = [
            [
                'id' => 1,
                'name' => 'Syed Abdul Rehman',
                'email' => 'sydabdrehman@gmail.com',
                'password' => Hash::make('sydabdrehman@gmail.com'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Hamid',
                'email' => 'hamid@asaancar.com',
                'password' => Hash::make('123hamid'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'MUHAMMAD FARAZ',
                'email' => 'farazsagheer00@gmail.com',
                'password' => Hash::make('faraz123'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'name' => 'Ahmed',
                'email' => 'ahmed@asaancar.com',
                'password' => Hash::make('ahmed123'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'name' => 'M. Nadeem',
                'email' => 'nadeem@asaancar.com',
                'password' => Hash::make('nadeem123'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'name' => 'Farhan',
                'email' => 'farhan@asaancar.com',
                'password' => Hash::make('farhan123'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 7,
                'name' => 'Sufiyan',
                'email' => 'sufiyan@asaancar.com',
                'password' => Hash::make('sufiyan123'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 8,
                'name' => 'Arsalan Khan',
                'email' => 'arsalan@asaancar.com',
                'password' => Hash::make('arsalan123'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Clear existing users
        User::truncate();

        // Insert users with fixed IDs
        foreach ($users as $userData) {
            User::create($userData);
            echo "Created user: {$userData['name']} (ID: {$userData['id']}) - {$userData['email']}\n";
        }

        // Assign roles
        $adminUser = User::find(1);
        if ($adminUser) {
            $adminUser->assignRole('admin');
            $adminUser->assignRole('store_owner');
            echo "Assigned admin and store_owner roles to: {$adminUser->name}\n";
        }

        // Assign store_owner role to other users
        for ($i = 2; $i <= 8; $i++) {
            $user = User::find($i);
            if ($user) {
                $user->assignRole('store_owner');
                echo "Assigned store_owner role to: {$user->name}\n";
            }
        }

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        echo "User seeding completed!\n";
    }
}