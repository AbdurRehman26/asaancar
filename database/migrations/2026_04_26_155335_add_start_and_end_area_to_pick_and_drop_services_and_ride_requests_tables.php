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
            if (! Schema::hasColumn('pick_and_drop_services', 'start_area')) {
                $table->string('start_area')->nullable()->after('start_location');
            }

            if (! Schema::hasColumn('pick_and_drop_services', 'end_area')) {
                $table->string('end_area')->nullable()->after('end_location');
            }
        });

        Schema::table('ride_requests', function (Blueprint $table) {
            if (! Schema::hasColumn('ride_requests', 'start_area')) {
                $table->string('start_area')->nullable()->after('start_location');
            }

            if (! Schema::hasColumn('ride_requests', 'end_area')) {
                $table->string('end_area')->nullable()->after('end_location');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ride_requests', function (Blueprint $table) {
            $columnsToDrop = [];

            if (Schema::hasColumn('ride_requests', 'start_area')) {
                $columnsToDrop[] = 'start_area';
            }

            if (Schema::hasColumn('ride_requests', 'end_area')) {
                $columnsToDrop[] = 'end_area';
            }

            if ($columnsToDrop !== []) {
                $table->dropColumn($columnsToDrop);
            }
        });

        Schema::table('pick_and_drop_services', function (Blueprint $table) {
            $columnsToDrop = [];

            if (Schema::hasColumn('pick_and_drop_services', 'start_area')) {
                $columnsToDrop[] = 'start_area';
            }

            if (Schema::hasColumn('pick_and_drop_services', 'end_area')) {
                $columnsToDrop[] = 'end_area';
            }

            if ($columnsToDrop !== []) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
