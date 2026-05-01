<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('live_ride_request_rejections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('live_ride_request_id')->constrained('live_ride_requests')->cascadeOnDelete();
            $table->foreignId('driver_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('rejected_at')->nullable()->index();
            $table->timestamps();

            $table->unique(['live_ride_request_id', 'driver_user_id'], 'live_ride_driver_unique_rejection');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_ride_request_rejections');
    }
};
