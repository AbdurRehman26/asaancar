<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Store;
use Illuminate\Support\Facades\Hash;

class StoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stores = [
            [
                'name' => 'Hamid Renta Car',
                'owner_name' => 'Hamid',
                'email' => 'hamid@asaancar.com',
                'password' => '123hamid',
                'address' => 'Shop No A-1, Sector 11-H, KDA Flats, Nagan Chowrangi, North Karachi',
                'contact_phone' => '+92345-2900079',
            ],
            [
                'name' => 'FARAZ TRANSPORT SERVICE',
                'owner_name' => 'MUHAMMAD FARAZ',
                'email' => 'farazsagheer00@gmail.com',
                'password' => 'faraz123',
                'address' => 'Shop No. K-6 Al Azam Square, Block-1, F.B Area, Karachi',
                'contact_phone' => '+92 311 1490902',
            ],
            [
                'name' => 'AHMED RENT A CAR Transport Services',
                'owner_name' => 'Ahmed',
                'email' => 'ahmed@asaancar.com',
                'password' => 'ahmed123',
                'address' => 'Shop #1, 10/703, Liaquatabad No.10, Karachi',
                'contact_phone' => '+92305-2272569 / +92345-2588802',
            ],
            [
                'name' => 'NS Rent-A-Car & Transport Services',
                'owner_name' => 'M. Nadeem',
                'email' => 'nadeem@asaancar.com',
                'password' => 'nadeem123',
                'address' => 'K-6, Al-Azam Square, F.B. Area, Karachi, Pakistan',
                'contact_phone' => '+92321-9288143 / +92311-8192158 / +92322-2656529 / +92311-3188271',
            ],
            [
                'name' => 'Farhan Rent A Car',
                'owner_name' => 'Farhan',
                'email' => 'farhan@asaancar.com',
                'password' => 'farhan123',
                'address' => 'Address not specified',
                'contact_phone' => '+92-312-2810139 / +92-343-1305474 / +92-312-2810474',
            ],
            [
                'name' => 'Sufiyan Car Deal',
                'owner_name' => 'Sufiyan',
                'email' => 'sufiyan@asaancar.com',
                'password' => 'sufiyan123',
                'address' => 'Shop # K-7A, Al-Azam Square, Block-1, F.B. Area, Karachi, Pakistan',
                'contact_phone' => '+92301-2983005 / +92314-3963803 / +92300-2157310',
            ],
            [
                'name' => 'Star Transport Services',
                'owner_name' => 'Arsalan Khan',
                'email' => 'arsalan@asaancar.com',
                'password' => 'arsalan123',
                'address' => 'Shop No K-6A, Al Azam Square, F.B. Area Block 1',
                'contact_phone' => '+92334-3268449 / +92342-2855663 / +92330-2540021',
            ],
        ];

        foreach ($stores as $storeData) {
            // Check if user exists
            $user = User::where('email', $storeData['email'])->first();

            if (!$user) {
                // Create user if doesn't exist
                $user = User::create([
                    'name' => $storeData['owner_name'],
                    'email' => $storeData['email'],
                    'password' => Hash::make($storeData['password']),
                    'email_verified_at' => now(),
                ]);

                // Assign store_owner role
                $user->assignRole('store_owner');

                echo "Created user: {$storeData['owner_name']} ({$storeData['email']})\n";
            } else {
                echo "User already exists: {$storeData['owner_name']} ({$storeData['email']})\n";
            }

            // Check if store exists
            $existingStore = Store::where('name', $storeData['name'])->first();

            if (!$existingStore) {
                // Create store
                $store = Store::create([
                    'name' => $storeData['name'],
                    'address' => $storeData['address'],
                    'contact_phone' => $storeData['contact_phone'],
                    'description' => "Professional car rental and transport services",
                    'user_id' => $user->id,
                ]);

                // Attach store to user using many-to-many relationship
                $user->stores()->attach($store->id);

                echo "Created store: {$storeData['name']} (User ID: {$user->id})\n";
            } else {
                echo "Store already exists: {$storeData['name']}\n";
            }
        }

        echo "Store seeding completed!\n";
    }
}
