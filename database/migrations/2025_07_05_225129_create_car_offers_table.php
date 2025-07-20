<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('car_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_id')->nullable()->constrained()->onDelete('cascade');
            $table->decimal('price_with_driver', 10, 2)->nullable();
            $table->decimal('price_without_driver', 10, 2)->nullable();
            $table->dateTime('available_from');
            $table->dateTime('available_to');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('car_offers');
    }
};
