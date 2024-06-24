<?php

use App\Models\RideOffer;
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
        Schema::create('ride_offer_details', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(RideOffer::class)->constrained();
            $table->string('duration_for');
            $table->boolean('with_driver');
            $table->string('price');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ride_offer_details');
    }
};
