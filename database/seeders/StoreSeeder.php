<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "Creating stores with fixed IDs...\n";

        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        $stores = [
            [
                'id' => 1,
                'store_username' => 'hamidrenta',
                'name' => 'Hamid Renta Car',
                'address' => 'Shop No A-1, Sector 11-H, KDA Flats, Nagan Chowrangi, North Karachi',
                'contact_phone' => '+92345-2900079',
                'description' => "Professional car rental and transport services",
                'user_id' => 2, // Hamid
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'store_username' => 'faraztransport',
                'name' => 'FARAZ TRANSPORT SERVICE',
                'address' => 'Shop No. K-6 Al Azam Square, Block-1, F.B Area, Karachi',
                'contact_phone' => '+92 311 1490902',
                'description' => "Professional car rental and transport services",
                'user_id' => 3, // MUHAMMAD FARAZ
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'store_username' => 'ahmedrentacar',
                'name' => 'AHMED RENT A CAR Transport Services',
                'address' => 'Shop #1, 10/703, Liaquatabad No.10, Karachi',
                'contact_phone' => '+92305-2272569 / +92345-2588802',
                'description' => "Professional car rental and transport services",
                'user_id' => 4, // Ahmed
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'store_username' => 'nsrentacar',
                'name' => 'NS Rent-A-Car & Transport Services',
                'address' => 'K-6, Al-Azam Square, F.B. Area, Karachi, Pakistan',
                'contact_phone' => '+92321-9288143 / +92311-8192158 / +92322-2656529 / +92311-3188271',
                'description' => "Professional car rental and transport services",
                'user_id' => 5, // M. Nadeem
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'store_username' => 'farhanrentacar',
                'name' => 'Farhan Rent A Car',
                'address' => 'Address not specified',
                'contact_phone' => '+92-312-2810139 / +92-343-1305474 / +92-312-2810474',
                'description' => "Professional car rental and transport services",
                'user_id' => 6, // Farhan
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'store_username' => 'sufiyancardeal',
                'name' => 'Sufiyan Car Deal',
                'address' => 'Shop # K-7A, Al-Azam Square, Block-1, F.B. Area, Karachi, Pakistan',
                'contact_phone' => '+92301-2983005 / +92314-3963803 / +92300-2157310',
                'description' => "Professional car rental and transport services",
                'user_id' => 7, // Sufiyan
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 7,
                'store_username' => 'startransportservices',
                'name' => 'Star Transport Services',
                'address' => 'Shop No K-6A, Al Azam Square, F.B. Area Block 1',
                'contact_phone' => '+92334-3268449 / +92342-2855663 / +92330-2540021',
                'description' => "Professional car rental and transport services",
                'user_id' => 8, // Arsalan Khan
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Clear existing stores and pivot table
        Store::truncate();
        DB::table('store_user')->truncate();

        // Insert stores with fixed IDs
        foreach ($stores as $storeData) {
            $store = Store::create($storeData);

            // Attach store to user using many-to-many relationship
            $user = User::find($storeData['user_id']);
            if ($user) {
                $user->stores()->attach($store->id);
                echo "Created store: {$store->name} (ID: {$store->id}) - Owner: {$user->name} (ID: {$user->id})\n";
            }
        }

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        echo "Store seeding completed!\n";
    }
}
