<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('conversations', 'ride_request_id')) {
            Schema::table('conversations', function (Blueprint $table) {
                $table->unsignedBigInteger('ride_request_id')->nullable()->after('pick_and_drop_service_id');
                $table->foreign('ride_request_id')->references('id')->on('ride_requests')->onDelete('cascade');
            });
        }

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            $currentType = DB::select("SHOW COLUMNS FROM conversations WHERE Field = 'type'");

            if (! empty($currentType) && strpos($currentType[0]->Type, "'ride_request'") === false) {
                DB::statement("ALTER TABLE conversations MODIFY COLUMN type ENUM('user', 'pick_and_drop', 'ride_request') NOT NULL");
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
            DB::statement("ALTER TABLE conversations MODIFY COLUMN type ENUM('user', 'pick_and_drop') NOT NULL");
        }

        Schema::table('conversations', function (Blueprint $table) {
            if (Schema::hasColumn('conversations', 'ride_request_id')) {
                $table->dropForeign(['ride_request_id']);
                $table->dropColumn('ride_request_id');
            }
        });
    }
};
