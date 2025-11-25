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
        Schema::table('pick_and_drop_services', function (Blueprint $table) {
            $table->foreignId('pickup_city_id')->nullable()->after('start_location')->constrained('cities')->onDelete('set null');
            $table->foreignId('dropoff_city_id')->nullable()->after('end_location')->constrained('cities')->onDelete('set null');
            $table->foreignId('pickup_area_id')->nullable()->after('pickup_city_id')->constrained('areas')->onDelete('set null');
            $table->foreignId('dropoff_area_id')->nullable()->after('dropoff_city_id')->constrained('areas')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pick_and_drop_services', function (Blueprint $table) {
            $table->dropForeign(['pickup_city_id']);
            $table->dropForeign(['dropoff_city_id']);
            $table->dropForeign(['pickup_area_id']);
            $table->dropForeign(['dropoff_area_id']);
            $table->dropColumn(['pickup_city_id', 'dropoff_city_id', 'pickup_area_id', 'dropoff_area_id']);
        });
    }
};
