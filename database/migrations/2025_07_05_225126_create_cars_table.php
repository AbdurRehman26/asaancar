<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('store_id');
            $table->foreign('store_id')->references('id')->on('stores')->onDelete('cascade');
            $table->unsignedBigInteger('car_brand_id');
            $table->foreign('car_brand_id')->references('id')->on('car_brands')->onDelete('cascade');
            $table->unsignedBigInteger('car_type_id');
            $table->foreign('car_type_id')->references('id')->on('car_types')->onDelete('cascade');
            $table->unsignedBigInteger('car_engine_id');
            $table->foreign('car_engine_id')->references('id')->on('car_engines')->onDelete('cascade');
            $table->string('model');
            $table->year('year');
            $table->string('name');
            $table->string('color');
            $table->text('description')->nullable();
            $table->json('image_urls')->nullable();
            $table->integer('seats');
            $table->string('transmission');
            $table->string('fuel_type');
            $table->boolean('available')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
