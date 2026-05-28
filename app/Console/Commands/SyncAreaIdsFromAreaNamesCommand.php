<?php

namespace App\Console\Commands;

use App\Models\Area;
use Illuminate\Console\Command;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SyncAreaIdsFromAreaNamesCommand extends Command
{
    protected $signature = 'areas:sync-ids-from-names
        {--source=all : Which records to sync (all/pick-and-drop/ride-request)}
        {--chunk=100 : Number of records to process per chunk}
        {--limit=0 : Maximum number of records to process per source}
        {--force : Overwrite existing area ID values}';

    protected $description = 'Resolve area IDs from stored area names and save matching areas.id values on ride records.';

    public function handle(): int
    {
        $source = strtolower((string) $this->option('source'));
        $chunkSize = max(1, (int) $this->option('chunk'));
        $limit = max(0, (int) $this->option('limit'));
        $force = (bool) $this->option('force');

        if (! in_array($source, ['all', 'pick-and-drop', 'ride-request'], true)) {
            $this->error('The source option must be one of: all, pick-and-drop, ride-request.');

            return self::FAILURE;
        }

        $totals = [];

        if (in_array($source, ['all', 'pick-and-drop'], true)) {
            $totals[] = $this->syncTable(
                source: 'PickAndDrop',
                table: 'pick_and_drop_services',
                startTargetColumns: ['start_area_id', 'pickup_area_id'],
                endTargetColumns: ['end_area_id', 'dropoff_area_id'],
                startCityColumn: 'pickup_city_id',
                endCityColumn: 'dropoff_city_id',
                chunkSize: $chunkSize,
                limit: $limit,
                force: $force,
            );
        }

        if (in_array($source, ['all', 'ride-request'], true)) {
            $totals[] = $this->syncTable(
                source: 'RideRequest',
                table: 'ride_requests',
                startTargetColumns: ['start_area_id'],
                endTargetColumns: ['end_area_id'],
                startCityColumn: 'city_id',
                endCityColumn: 'city_id',
                chunkSize: $chunkSize,
                limit: $limit,
                force: $force,
            );
        }

        $this->newLine();
        $this->table(['Source', 'Processed', 'Updated', 'Skipped', 'Unmatched'], $totals);

        return self::SUCCESS;
    }

    /**
     * @param  array<int, string>  $startTargetColumns
     * @param  array<int, string>  $endTargetColumns
     * @return array{source: string, processed: int, updated: int, skipped: int, unmatched: int}
     */
    private function syncTable(
        string $source,
        string $table,
        array $startTargetColumns,
        array $endTargetColumns,
        string $startCityColumn,
        string $endCityColumn,
        int $chunkSize,
        int $limit,
        bool $force,
    ): array {
        $totals = [
            'source' => $source,
            'processed' => 0,
            'updated' => 0,
            'skipped' => 0,
            'unmatched' => 0,
        ];

        if (! Schema::hasTable($table)) {
            $this->warn("Skipped {$source}: {$table} table does not exist.");

            return $totals;
        }

        $startTargetColumn = $this->firstExistingColumn($table, $startTargetColumns);
        $endTargetColumn = $this->firstExistingColumn($table, $endTargetColumns);

        if ($startTargetColumn === null || $endTargetColumn === null) {
            $this->warn("Skipped {$source}: {$table} is missing area ID target columns.");

            return $totals;
        }

        if (! Schema::hasColumns($table, ['start_area', 'end_area'])) {
            $this->warn("Skipped {$source}: {$table} is missing area name columns.");

            return $totals;
        }

        $query = DB::table($table)->orderBy('id');
        $this->filterCandidates($query, $startTargetColumn, $endTargetColumn, $force);

        if ($limit > 0) {
            $query->limit($limit);
        }

        $query->chunk($chunkSize, function ($records) use (
            &$totals,
            $table,
            $startTargetColumn,
            $endTargetColumn,
            $startCityColumn,
            $endCityColumn,
            $force,
        ): void {
            foreach ($records as $record) {
                $totals['processed']++;

                $updates = [];
                $unmatched = false;

                $startAreaId = $this->resolveAreaId(
                    areaName: $record->start_area,
                    cityId: $this->columnValue($record, $startCityColumn),
                );

                if ($startAreaId !== null && ($force || $record->{$startTargetColumn} === null)) {
                    $updates[$startTargetColumn] = $startAreaId;
                } elseif ($record->start_area !== null) {
                    $unmatched = $record->{$startTargetColumn} === null;
                }

                $endAreaId = $this->resolveAreaId(
                    areaName: $record->end_area,
                    cityId: $this->columnValue($record, $endCityColumn),
                );

                if ($endAreaId !== null && ($force || $record->{$endTargetColumn} === null)) {
                    $updates[$endTargetColumn] = $endAreaId;
                } elseif ($record->end_area !== null) {
                    $unmatched = $record->{$endTargetColumn} === null;
                }

                if ($updates === []) {
                    $totals[$unmatched ? 'unmatched' : 'skipped']++;

                    continue;
                }

                $updates['updated_at'] = now();

                DB::table($table)
                    ->where('id', $record->id)
                    ->update($updates);

                $totals['updated']++;
            }
        });

        return $totals;
    }

    private function filterCandidates(Builder $query, string $startTargetColumn, string $endTargetColumn, bool $force): void
    {
        $query->where(function (Builder $builder): void {
            $builder
                ->whereNotNull('start_area')
                ->orWhereNotNull('end_area');
        });

        if (! $force) {
            $query->where(function (Builder $builder) use ($startTargetColumn, $endTargetColumn): void {
                $builder
                    ->whereNull($startTargetColumn)
                    ->orWhereNull($endTargetColumn);
            });
        }
    }

    private function resolveAreaId(mixed $areaName, mixed $cityId): ?int
    {
        if (! filled($areaName)) {
            return null;
        }

        $query = Area::query()
            ->whereRaw('LOWER(name) = ?', [mb_strtolower((string) $areaName)]);

        if (filled($cityId)) {
            return $query
                ->where('city_id', (int) $cityId)
                ->value('id');
        }

        $areaIds = $query
            ->limit(2)
            ->pluck('id');

        return $areaIds->count() === 1 ? (int) $areaIds->first() : null;
    }

    private function columnValue(object $record, string $column): mixed
    {
        return property_exists($record, $column) ? $record->{$column} : null;
    }

    /**
     * @param  array<int, string>  $columns
     */
    private function firstExistingColumn(string $table, array $columns): ?string
    {
        foreach ($columns as $column) {
            if (Schema::hasColumn($table, $column)) {
                return $column;
            }
        }

        return null;
    }
}
