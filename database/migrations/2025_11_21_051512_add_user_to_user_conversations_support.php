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
        // Check if recipient_user_id already exists
        if (!Schema::hasColumn('conversations', 'recipient_user_id')) {
            Schema::table('conversations', function (Blueprint $table) {
                $table->unsignedBigInteger('recipient_user_id')->nullable()->after('type');
                $table->foreign('recipient_user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
        
        // Modify enum using raw SQL (MySQL doesn't support ALTER ENUM directly)
        // Check current enum values first - use database-agnostic approach
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            $currentType = \DB::select("SHOW COLUMNS FROM conversations WHERE Field = 'type'");
            if (!empty($currentType) && strpos($currentType[0]->Type, "'user'") === false) {
                \DB::statement("ALTER TABLE conversations MODIFY COLUMN type ENUM('user') NOT NULL");
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
            \DB::statement("ALTER TABLE conversations MODIFY COLUMN type ENUM('user') NOT NULL");
        }
        // SQLite doesn't support ALTER ENUM, so we skip this for SQLite
        
        Schema::table('conversations', function (Blueprint $table) {
            if (Schema::hasColumn('conversations', 'recipient_user_id')) {
                $table->dropForeign(['recipient_user_id']);
                $table->dropColumn('recipient_user_id');
            }
        });
    }
};
