<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('car_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('number_of_days')->default(1);
            $table->unsignedBigInteger('car_offer_id')->nullable();
            $table->foreign('car_offer_id')->references('id')->on('car_offers')->onDelete('set null');
            $table->unsignedBigInteger('store_id');
            $table->foreign('store_id')->references('id')->on('stores')->onDelete('cascade');
            $table->string('pickup_time');
            $table->date('pickup_date');
            $table->string('rental_type');
            $table->string('pickup_location');
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->decimal('total_price', 10, 2);
            $table->string('currency', 8)->default('PKR');
            $table->decimal('refill_amount_per_km', 8, 2)->default(40);
            $table->boolean('refill_tank')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
