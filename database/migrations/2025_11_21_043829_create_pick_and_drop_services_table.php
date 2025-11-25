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
        Schema::create('pick_and_drop_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('car_id')->nullable()->constrained()->onDelete('set null');
            
            // Start and end locations
            $table->string('start_location');
            $table->decimal('start_latitude', 10, 8)->nullable();
            $table->decimal('start_longitude', 11, 8)->nullable();
            $table->string('end_location');
            $table->decimal('end_latitude', 10, 8)->nullable();
            $table->decimal('end_longitude', 11, 8)->nullable();
            
            // Car details
            $table->integer('available_spaces');
            $table->enum('driver_gender', ['male', 'female'])->default('male');
            $table->string('car_brand')->nullable();
            $table->string('car_model')->nullable();
            $table->string('car_color')->nullable();
            $table->integer('car_seats')->nullable();
            $table->enum('car_transmission', ['manual', 'automatic'])->nullable();
            $table->enum('car_fuel_type', ['petrol', 'diesel', 'electric', 'hybrid'])->nullable();
            
            // Service details
            $table->dateTime('departure_time');
            $table->text('description')->nullable();
            $table->decimal('price_per_person', 10, 2)->nullable();
            $table->string('currency', 8)->default('PKR');
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pick_and_drop_services');
    }
};
