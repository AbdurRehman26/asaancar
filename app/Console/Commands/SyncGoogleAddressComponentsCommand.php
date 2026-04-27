<?php

namespace App\Console\Commands;

use App\Models\Area;
use App\Models\City;
use App\Models\PickAndDrop;
use App\Models\RideRequest;
use App\Services\GoogleAddressComponentLookupService;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class SyncGoogleAddressComponentsCommand extends Command
{
    protected $signature = 'addresses:sync-google-components
        {--source=all : Which records to sync (all/pick-and-drop/ride-request)}
        {--chunk=50 : Number of records to process per chunk}
        {--limit=0 : Maximum number of records to process per source}
        {--force : Re-sync records even if start_area and end_area are already filled}';

    protected $description = 'Loop through rides and ride requests, fetch Google address components, and store the resolved address data.';

    public function handle(GoogleAddressComponentLookupService $lookupService): int
    {
        $source = strtolower((string) $this->option('source'));
        $chunkSize = max(1, (int) $this->option('chunk'));
        $limit = max(0, (int) $this->option('limit'));
        $force = (bool) $this->option('force');

        if (! in_array($source, ['all', 'pick-and-drop', 'ride-request'], true)) {
            $this->error('The source option must be one of: all, pick-and-drop, ride-request.');

            return self::FAILURE;
        }

        $totals = [
            'processed' => 0,
            'updated' => 0,
            'skipped' => 0,
        ];

        if (in_array($source, ['all', 'pick-and-drop'], true)) {
            $this->info('Syncing pick and drop services...');

            $this->syncRecords(
                query: PickAndDrop::query()->orderBy('id'),
                lookupService: $lookupService,
                chunkSize: $chunkSize,
                limit: $limit,
                force: $force,
                afterLookup: function (PickAndDrop $service, array $startResult, array $endResult): void {
                    $service->forceFill([
                        'start_area' => $this->resolveAreaValue($startResult),
                        'start_place_id' => $startResult['place_id'],
                        'start_latitude' => $startResult['latitude'],
                        'start_longitude' => $startResult['longitude'],
                        'end_area' => $this->resolveAreaValue($endResult),
                        'end_place_id' => $endResult['place_id'],
                        'end_latitude' => $endResult['latitude'],
                        'end_longitude' => $endResult['longitude'],
                        'pickup_city_id' => $this->resolveCityId($startResult['components']['city'] ?? null, $service->pickup_city_id),
                        'dropoff_city_id' => $this->resolveCityId($endResult['components']['city'] ?? null, $service->dropoff_city_id),
                    ]);

                    $service->pickup_area_id = $this->resolveAreaId(
                        areaName: $service->start_area,
                        cityId: $service->pickup_city_id,
                        currentAreaId: $service->pickup_area_id,
                    );
                    $service->dropoff_area_id = $this->resolveAreaId(
                        areaName: $service->end_area,
                        cityId: $service->dropoff_city_id,
                        currentAreaId: $service->dropoff_area_id,
                    );
                },
                totals: $totals,
            );
        }

        if (in_array($source, ['all', 'ride-request'], true)) {
            $this->info('Syncing ride requests...');

            $this->syncRecords(
                query: RideRequest::query()->orderBy('id'),
                lookupService: $lookupService,
                chunkSize: $chunkSize,
                limit: $limit,
                force: $force,
                afterLookup: function (RideRequest $request, array $startResult, array $endResult): void {
                    $request->forceFill([
                        'start_area' => $this->resolveAreaValue($startResult),
                        'start_place_id' => $startResult['place_id'],
                        'start_latitude' => $startResult['latitude'],
                        'start_longitude' => $startResult['longitude'],
                        'end_area' => $this->resolveAreaValue($endResult),
                        'end_place_id' => $endResult['place_id'],
                        'end_latitude' => $endResult['latitude'],
                        'end_longitude' => $endResult['longitude'],
                    ]);
                },
                totals: $totals,
            );
        }

        $this->newLine();
        $this->table(
            ['Processed', 'Updated', 'Skipped'],
            [[
                $totals['processed'],
                $totals['updated'],
                $totals['skipped'],
            ]]
        );

        return self::SUCCESS;
    }

    /**
     * @param  Builder<Model>  $query
     * @param  callable(Model, array<string, mixed>, array<string, mixed>): void  $afterLookup
     * @param  array{processed: int, updated: int, skipped: int}  $totals
     */
    private function syncRecords(
        Builder $query,
        GoogleAddressComponentLookupService $lookupService,
        int $chunkSize,
        int $limit,
        bool $force,
        callable $afterLookup,
        array &$totals,
    ): void {
        $query->whereNotBetween('user_id', [1, 11]);

        if (! $force) {
            $query->where(function (Builder $builder): void {
                $builder
                    ->whereNull('start_area')
                    ->orWhereNull('end_area');
            });
        }

        if ($limit > 0) {
            $query->limit($limit);
        }

        $query
            ->get()
            ->chunk($chunkSize)
            ->each(function ($records) use ($lookupService, $afterLookup, &$totals): void {
                foreach ($records as $record) {
                    $totals['processed']++;

                    try {
                        $startResult = $lookupService->lookup($this->buildLookupPayload($record, 'start'));
                        $endResult = $lookupService->lookup($this->buildLookupPayload($record, 'end'));

                        $afterLookup($record, $startResult, $endResult);

                        if ($record->isDirty()) {
                            $record->save();
                            $totals['updated']++;
                        } else {
                            $totals['skipped']++;
                        }
                    } catch (\Throwable $exception) {
                        $totals['skipped']++;
                        $this->warn('Skipped '.class_basename($record).' #'.$record->getKey().': '.$exception->getMessage());
                    }
                }
            });
    }

    /**
     * @return array{address: string, place_id: string|null}
     */
    private function buildLookupPayload(Model $record, string $prefix): array
    {
        $placeId = $record->getAttribute($prefix.'_place_id');
        $location = (string) $record->getAttribute($prefix.'_location');

        if (filled($placeId)) {
            return [
                'address' => '',
                'place_id' => (string) $placeId,
            ];
        }

        if ($location === '') {
            throw new \RuntimeException('Missing '.$prefix.'_location.');
        }

        return [
            'address' => $location,
            'place_id' => null,
        ];
    }

    /**
     * @param  array<string, mixed>  $lookupResult
     */
    private function resolveAreaValue(array $lookupResult): ?string
    {
        $components = $lookupResult['components'] ?? [];

        if (! is_array($components)) {
            return null;
        }

        return $components['neighborhood'] ?? $components['sublocality'] ?? $components['route'] ?? null;
    }

    private function resolveCityId(?string $cityName, ?int $currentCityId): ?int
    {
        if ($cityName === null || $cityName === '') {
            return $currentCityId;
        }

        return City::query()
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($cityName)])
            ->value('id') ?? $currentCityId;
    }

    private function resolveAreaId(?string $areaName, ?int $cityId, ?int $currentAreaId): ?int
    {
        if ($areaName === null || $areaName === '' || $cityId === null) {
            return $currentAreaId;
        }

        return Area::query()
            ->where('city_id', $cityId)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($areaName)])
            ->value('id') ?? $currentAreaId;
    }
}
