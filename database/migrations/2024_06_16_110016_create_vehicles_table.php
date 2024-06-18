<?php

use App\Models\User;
use App\Models\VehicleModel;
use App\Models\VehicleType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(VehicleType::class)->constrained();
            $table->foreignIdFor(VehicleModel::class)->constrained();
            $table->foreignIdFor(User::class)->constrained();
            $table->text('details');
            $table->string('number_plate');
            $table->string('color');
            $table->date('year_of_manufacture');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
