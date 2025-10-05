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
            $table->foreignId('car_model_id')->nullable()->after('car_brand_id')->constrained()->onDelete('set null');
            $table->index(['car_model_id', 'car_brand_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->dropForeign(['car_model_id']);
            $table->dropIndex(['car_model_id', 'car_brand_id']);
            $table->dropColumn('car_model_id');
        });
    }
};
