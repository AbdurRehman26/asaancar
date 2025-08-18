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
        Schema::table('cars', function (Blueprint $table) {
            $table->dropForeign(['car_engine_id']);
            $table->dropColumn('car_engine_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->unsignedBigInteger('car_engine_id')->after('car_type_id');
            $table->foreign('car_engine_id')->references('id')->on('car_engines')->onDelete('cascade');
        });
    }
};
