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
                'name' => 'Car',
                'code' => 'car'
            ],
        ];


        foreach ($carTypes as $carType){
            VehicleType::query()->firstOrCreate($carType);
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
