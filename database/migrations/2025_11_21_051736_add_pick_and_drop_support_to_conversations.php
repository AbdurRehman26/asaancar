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
        // Add pick_and_drop_service_id column
        if (!Schema::hasColumn('conversations', 'pick_and_drop_service_id')) {
            Schema::table('conversations', function (Blueprint $table) {
                $table->unsignedBigInteger('pick_and_drop_service_id')->nullable()->after('store_id');
                $table->foreign('pick_and_drop_service_id')->references('id')->on('pick_and_drop_services')->onDelete('cascade');
            });
        }
        
        // Update enum to include 'pick_and_drop' type - use database-agnostic approach
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            $currentType = \DB::select("SHOW COLUMNS FROM conversations WHERE Field = 'type'");
            if (!empty($currentType) && strpos($currentType[0]->Type, "'pick_and_drop'") === false) {
                \DB::statement("ALTER TABLE conversations MODIFY COLUMN type ENUM('booking', 'store', 'user', 'pick_and_drop') NOT NULL");
            }
        } elseif ($driver === 'sqlite') {
            // SQLite doesn't support ENUM, so we'll use a text column with a check constraint
            // For SQLite, we just need to ensure the column exists and can accept the new value
            if (Schema::hasColumn('conversations', 'type')) {
                // SQLite doesn't support ALTER ENUM, so we skip this for SQLite
                // The column will be text type in SQLite and can accept any string value
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            // Remove 'pick_and_drop' from enum
            \DB::statement("ALTER TABLE conversations MODIFY COLUMN type ENUM('booking', 'store', 'user') NOT NULL");
        }
        // SQLite doesn't support ALTER ENUM, so we skip this for SQLite
        
        Schema::table('conversations', function (Blueprint $table) {
            if (Schema::hasColumn('conversations', 'pick_and_drop_service_id')) {
                $table->dropForeign(['pick_and_drop_service_id']);
                $table->dropColumn('pick_and_drop_service_id');
            }
        });
    }
};
