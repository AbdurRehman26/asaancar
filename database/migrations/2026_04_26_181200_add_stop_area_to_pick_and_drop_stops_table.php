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
            if (! Schema::hasColumn('pick_and_drop_stops', 'stop_area')) {
                $table->string('stop_area')->nullable()->after('location');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pick_and_drop_stops', function (Blueprint $table) {
            if (Schema::hasColumn('pick_and_drop_stops', 'stop_area')) {
                $table->dropColumn('stop_area');
            }
        });
    }
};
