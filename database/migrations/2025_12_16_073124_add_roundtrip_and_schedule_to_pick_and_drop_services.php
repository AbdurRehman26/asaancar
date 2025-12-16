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
            $table->boolean('is_roundtrip')->default(false)->after('is_active');
            $table->time('return_time')->nullable()->after('is_roundtrip');
            $table->string('schedule_type')->default('once')->after('return_time'); // once, everyday, weekdays, weekends, custom
            $table->json('selected_days')->nullable()->after('schedule_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pick_and_drop_services', function (Blueprint $table) {
            $table->dropColumn(['is_roundtrip', 'return_time', 'schedule_type', 'selected_days']);
        });
    }
};
