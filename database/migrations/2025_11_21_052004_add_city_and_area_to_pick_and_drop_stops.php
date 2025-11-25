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
        Schema::table('pick_and_drop_stops', function (Blueprint $table) {
            if (!Schema::hasColumn('pick_and_drop_stops', 'city_id')) {
                $table->foreignId('city_id')->nullable()->after('location')->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('pick_and_drop_stops', 'area_id')) {
                $table->foreignId('area_id')->nullable()->after('city_id')->constrained()->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pick_and_drop_stops', function (Blueprint $table) {
            $table->dropForeign(['city_id']);
            $table->dropForeign(['area_id']);
            $table->dropColumn(['city_id', 'area_id']);
        });
    }
};
