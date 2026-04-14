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
            if (! Schema::hasColumn('pick_and_drop_services', 'is_system_generated')) {
                $table->boolean('is_system_generated')->default(false)->after('is_active');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pick_and_drop_services', function (Blueprint $table) {
            if (Schema::hasColumn('pick_and_drop_services', 'is_system_generated')) {
                $table->dropColumn('is_system_generated');
            }
        });
    }
};
