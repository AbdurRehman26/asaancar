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
        Schema::table('pick_and_drop_services', function (Blueprint $table) {
            if (! Schema::hasColumn('pick_and_drop_services', 'start_area_google_id')) {
                $table->string('start_area_google_id')->nullable()->after('start_area');
            }

            if (! Schema::hasColumn('pick_and_drop_services', 'end_area_google_id')) {
                $table->string('end_area_google_id')->nullable()->after('end_area');
            }
        });

        Schema::table('ride_requests', function (Blueprint $table) {
            if (! Schema::hasColumn('ride_requests', 'start_area_google_id')) {
                $table->string('start_area_google_id')->nullable()->after('start_area');
            }

            if (! Schema::hasColumn('ride_requests', 'end_area_google_id')) {
                $table->string('end_area_google_id')->nullable()->after('end_area');
            }
        });

        $this->copyAreaIdsToGoogleAreaIds('pick_and_drop_services', ['start_area_id', 'pickup_area_id'], ['end_area_id', 'dropoff_area_id']);
        $this->copyAreaIdsToGoogleAreaIds('ride_requests', ['start_area_id'], ['end_area_id']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ride_requests', function (Blueprint $table) {
            $columnsToDrop = [];

            if (Schema::hasColumn('ride_requests', 'start_area_google_id')) {
                $columnsToDrop[] = 'start_area_google_id';
            }

            if (Schema::hasColumn('ride_requests', 'end_area_google_id')) {
                $columnsToDrop[] = 'end_area_google_id';
            }

            if ($columnsToDrop !== []) {
                $table->dropColumn($columnsToDrop);
            }
        });

        Schema::table('pick_and_drop_services', function (Blueprint $table) {
            $columnsToDrop = [];

            if (Schema::hasColumn('pick_and_drop_services', 'start_area_google_id')) {
                $columnsToDrop[] = 'start_area_google_id';
            }

            if (Schema::hasColumn('pick_and_drop_services', 'end_area_google_id')) {
                $columnsToDrop[] = 'end_area_google_id';
            }

            if ($columnsToDrop !== []) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    /**
     * @param  array<int, string>  $startColumns
     * @param  array<int, string>  $endColumns
     */
    private function copyAreaIdsToGoogleAreaIds(string $table, array $startColumns, array $endColumns): void
    {
        $this->copyFirstExistingColumn($table, $startColumns, 'start_area_google_id');
        $this->copyFirstExistingColumn($table, $endColumns, 'end_area_google_id');
    }

    /**
     * @param  array<int, string>  $sourceColumns
     */
    private function copyFirstExistingColumn(string $table, array $sourceColumns, string $targetColumn): void
    {
        foreach ($sourceColumns as $sourceColumn) {
            if (! Schema::hasColumn($table, $sourceColumn) || ! Schema::hasColumn($table, $targetColumn)) {
                continue;
            }

            DB::table($table)
                ->whereNull($targetColumn)
                ->whereNotNull($sourceColumn)
                ->update([$targetColumn => DB::raw($sourceColumn)]);

            return;
        }
    }
};
