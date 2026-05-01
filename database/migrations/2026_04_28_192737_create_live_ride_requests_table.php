<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('live_ride_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rider_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('driver_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->index();
            $table->string('pickup_place_id')->nullable();
            $table->string('pickup_location');
            $table->decimal('pickup_latitude', 10, 7);
            $table->decimal('pickup_longitude', 10, 7);
            $table->string('dropoff_place_id')->nullable();
            $table->string('dropoff_location');
            $table->decimal('dropoff_latitude', 10, 7);
            $table->decimal('dropoff_longitude', 10, 7);
            $table->string('vehicle_type')->nullable()->index();
            $table->decimal('estimated_fare', 10, 2);
            $table->decimal('final_fare', 10, 2)->nullable();
            $table->decimal('distance_km', 8, 2)->nullable();
            $table->unsignedInteger('eta_minutes')->nullable();
            $table->string('currency', 8)->default('PKR');
            $table->timestamp('requested_at')->nullable()->index();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('arrived_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancelled_by')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();

            $table->index(['rider_user_id', 'status']);
            $table->index(['driver_user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_ride_requests');
    }
};
