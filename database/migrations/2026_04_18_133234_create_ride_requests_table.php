<?php

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
        Schema::create('ride_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->string('contact')->nullable();
            $table->string('start_location');
            $table->string('start_place_id')->nullable();
            $table->decimal('start_latitude', 10, 8)->nullable();
            $table->decimal('start_longitude', 11, 8)->nullable();
            $table->string('end_location');
            $table->string('end_place_id')->nullable();
            $table->decimal('end_latitude', 10, 8)->nullable();
            $table->decimal('end_longitude', 11, 8)->nullable();
            $table->dateTime('departure_time');
            $table->enum('schedule_type', ['once', 'everyday', 'weekdays', 'weekends', 'custom'])->default('once');
            $table->json('selected_days')->nullable();
            $table->boolean('is_roundtrip')->default(false);
            $table->time('return_time')->nullable();
            $table->unsignedInteger('required_seats')->default(1);
            $table->enum('preferred_driver_gender', ['male', 'female', 'any'])->default('any');
            $table->unsignedInteger('budget_per_seat')->nullable();
            $table->string('currency', 8)->default('PKR');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ride_requests');
    }
};
