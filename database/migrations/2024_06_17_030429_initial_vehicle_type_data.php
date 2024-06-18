<?php

use App\Models\VehicleType;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $carTypes = [
            [
                'name' => 'Car'
            ],
        ];


        foreach ($carTypes as $carType){
            VehicleType::query()->firstOrCreate([
                'name' => $carType['name'],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
