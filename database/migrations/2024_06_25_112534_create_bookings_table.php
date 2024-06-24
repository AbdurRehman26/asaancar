<?php

use App\Models\BookingStatus;
use App\Models\RideOffer;
use App\Models\User;
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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(RideOffer::class)->constrained();
            $table->foreignIdFor(BookingStatus::class)->constrained();
            $table->foreignIdFor(User::class)->constrained();
            $table->text('from_location');
            $table->text('to_location')->nullable();
            $table->dateTime('from_date_time');
            $table->dateTime('to_date_time');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
