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
            if (! Schema::hasColumn('pick_and_drop_services', 'start_place_id')) {
                $table->string('start_place_id')->nullable()->after('start_location');
            }

            if (! Schema::hasColumn('pick_and_drop_services', 'end_place_id')) {
                $table->string('end_place_id')->nullable()->after('end_location');
            }
        });

        Schema::table('pick_and_drop_stops', function (Blueprint $table) {
            if (! Schema::hasColumn('pick_and_drop_stops', 'place_id')) {
                $table->string('place_id')->nullable()->after('location');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pick_and_drop_stops', function (Blueprint $table) {
            if (Schema::hasColumn('pick_and_drop_stops', 'place_id')) {
                $table->dropColumn('place_id');
            }
        });

        Schema::table('pick_and_drop_services', function (Blueprint $table) {
            $columnsToDrop = [];

            if (Schema::hasColumn('pick_and_drop_services', 'start_place_id')) {
                $columnsToDrop[] = 'start_place_id';
            }

            if (Schema::hasColumn('pick_and_drop_services', 'end_place_id')) {
                $columnsToDrop[] = 'end_place_id';
            }

            if ($columnsToDrop !== []) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
