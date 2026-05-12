<?php

namespace App\Console\Commands;

use App\Models\City;
use App\Models\PickAndDrop;
use App\Models\RideRequest;
use App\Services\GoogleAddressComponentLookupService;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Throwable;

class LookupCitiesFromPlaceIdsCommand extends Command
{
    protected $signature = 'places:lookup-cities
        {start_place_id? : Optional Google Place ID for the start location}
        {end_place_id? : Optional Google Place ID for the end location}
        {--limit=100 : Maximum records to scan in default mode}';

    protected $description = 'Look up cities for matching place IDs, or scan rides and ride requests missing city assignments by default.';

    public function handle(GoogleAddressComponentLookupService $lookupService): int
    {
        $startPlaceId = filled($this->argument('start_place_id')) ? (string) $this->argument('start_place_id') : null;
        $endPlaceId = filled($this->argument('end_place_id')) ? (string) $this->argument('end_place_id') : null;
        $limit = max(1, (int) $this->option('limit'));
        $cities = City::query()->orderByDesc('name')->get(['id', 'name']);
        $rows = collect();

        if ($startPlaceId !== null || $endPlaceId !== null) {
            $this->collectMatchingRows(
                rows: $rows,
                lookupService: $lookupService,
                cities: $cities,
                startPlaceId: $startPlaceId,
                endPlaceId: $endPlaceId,
            );
        } else {
            $this->collectMissingCityRows(
                rows: $rows,
                lookupService: $lookupService,
                cities: $cities,
                limit: $limit,
            );
        }

        if ($rows->isEmpty()) {
            $this->warn('No pick and drop services or ride requests required city lookup.');

            return self::SUCCESS;
        }

        $this->table(['Source', 'Record ID', 'Point', 'Place ID', 'Existing City', 'Resolved City', 'Location'], $rows->all());

        return self::SUCCESS;
    }

    /**
     * @param  Collection<int, array<string, int|string>>  $rows
     * @param  Collection<int, City>  $cities
     */
    private function collectMatchingRows(
        Collection $rows,
        GoogleAddressComponentLookupService $lookupService,
        Collection $cities,
        ?string $startPlaceId,
        ?string $endPlaceId,
    ): void {
        PickAndDrop::query()
            ->with(['pickupCity', 'dropoffCity'])
            ->when($startPlaceId !== null || $endPlaceId !== null, function ($query) use ($startPlaceId, $endPlaceId): void {
                $query->where(function ($nestedQuery) use ($startPlaceId, $endPlaceId): void {
                    if ($startPlaceId !== null) {
                        $nestedQuery->orWhere('start_place_id', $startPlaceId);
                    }

                    if ($endPlaceId !== null) {
                        $nestedQuery->orWhere('end_place_id', $endPlaceId);
                    }
                });
            })
            ->get()
            ->each(function (PickAndDrop $service) use ($startPlaceId, $endPlaceId, $lookupService, $cities, $rows): void {
                if ($startPlaceId !== null && $service->start_place_id === $startPlaceId) {
                    $this->pushResolvedRow(
                        rows: $rows,
                        source: 'PickAndDrop',
                        recordId: $service->id,
                        point: 'Start',
                        placeId: $startPlaceId,
                        existingCity: $service->pickupCity?->name,
                        location: $service->start_location,
                        resolvedCity: $this->resolveCityName($lookupService, $cities, $startPlaceId, $service->start_location),
                    );
                }

                if ($endPlaceId !== null && $service->end_place_id === $endPlaceId) {
                    $this->pushResolvedRow(
                        rows: $rows,
                        source: 'PickAndDrop',
                        recordId: $service->id,
                        point: 'End',
                        placeId: $endPlaceId,
                        existingCity: $service->dropoffCity?->name,
                        location: $service->end_location,
                        resolvedCity: $this->resolveCityName($lookupService, $cities, $endPlaceId, $service->end_location),
                    );
                }
            });

        RideRequest::query()
            ->when($startPlaceId !== null || $endPlaceId !== null, function ($query) use ($startPlaceId, $endPlaceId): void {
                $query->where(function ($nestedQuery) use ($startPlaceId, $endPlaceId): void {
                    if ($startPlaceId !== null) {
                        $nestedQuery->orWhere('start_place_id', $startPlaceId);
                    }

                    if ($endPlaceId !== null) {
                        $nestedQuery->orWhere('end_place_id', $endPlaceId);
                    }
                });
            })
            ->get()
            ->each(function (RideRequest $request) use ($startPlaceId, $endPlaceId, $lookupService, $cities, $rows): void {
                if ($startPlaceId !== null && $request->start_place_id === $startPlaceId) {
                    $this->pushResolvedRow(
                        rows: $rows,
                        source: 'RideRequest',
                        recordId: $request->id,
                        point: 'Start',
                        placeId: $startPlaceId,
                        existingCity: null,
                        location: $request->start_location,
                        resolvedCity: $this->resolveCityName($lookupService, $cities, $startPlaceId, $request->start_location),
                    );
                }

                if ($endPlaceId !== null && $request->end_place_id === $endPlaceId) {
                    $this->pushResolvedRow(
                        rows: $rows,
                        source: 'RideRequest',
                        recordId: $request->id,
                        point: 'End',
                        placeId: $endPlaceId,
                        existingCity: null,
                        location: $request->end_location,
                        resolvedCity: $this->resolveCityName($lookupService, $cities, $endPlaceId, $request->end_location),
                    );
                }
            });
    }

    /**
     * @param  Collection<int, array<string, int|string>>  $rows
     * @param  Collection<int, City>  $cities
     */
    private function collectMissingCityRows(
        Collection $rows,
        GoogleAddressComponentLookupService $lookupService,
        Collection $cities,
        int $limit,
    ): void {
        $this->info('Scanning pick and drop services missing pickup/dropoff city IDs...');

        PickAndDrop::query()
            ->with(['pickupCity', 'dropoffCity'])
            ->where(function ($query): void {
                $query->whereNull('pickup_city_id')
                    ->orWhereNull('dropoff_city_id');
            })
            ->orderBy('id')
            ->limit($limit)
            ->get()
            ->each(function (PickAndDrop $service) use ($lookupService, $cities, $rows): void {
                if ($service->pickup_city_id === null) {
                    $this->pushResolvedRow(
                        rows: $rows,
                        source: 'PickAndDrop',
                        recordId: $service->id,
                        point: 'Start',
                        placeId: $service->start_place_id,
                        existingCity: null,
                        location: $service->start_location,
                        resolvedCity: $this->resolveCityName($lookupService, $cities, $service->start_place_id, $service->start_location),
                    );
                }

                if ($service->dropoff_city_id === null) {
                    $this->pushResolvedRow(
                        rows: $rows,
                        source: 'PickAndDrop',
                        recordId: $service->id,
                        point: 'End',
                        placeId: $service->end_place_id,
                        existingCity: null,
                        location: $service->end_location,
                        resolvedCity: $this->resolveCityName($lookupService, $cities, $service->end_place_id, $service->end_location),
                    );
                }
            });

        $this->info('Scanning ride requests for city lookup...');

        RideRequest::query()
            ->where(function ($query): void {
                $query->whereNotNull('start_place_id')
                    ->orWhereNotNull('end_place_id');
            })
            ->orderBy('id')
            ->limit($limit)
            ->get()
            ->each(function (RideRequest $request) use ($lookupService, $cities, $rows): void {
                $this->pushResolvedRow(
                    rows: $rows,
                    source: 'RideRequest',
                    recordId: $request->id,
                    point: 'Start',
                    placeId: $request->start_place_id,
                    existingCity: null,
                    location: $request->start_location,
                    resolvedCity: $this->resolveCityName($lookupService, $cities, $request->start_place_id, $request->start_location),
                );

                $this->pushResolvedRow(
                    rows: $rows,
                    source: 'RideRequest',
                    recordId: $request->id,
                    point: 'End',
                    placeId: $request->end_place_id,
                    existingCity: null,
                    location: $request->end_location,
                    resolvedCity: $this->resolveCityName($lookupService, $cities, $request->end_place_id, $request->end_location),
                );
            });
    }

    /**
     * @param  Collection<int, array<string, int|string>>  $rows
     */
    private function pushResolvedRow(
        Collection $rows,
        string $source,
        int $recordId,
        string $point,
        ?string $placeId,
        ?string $existingCity,
        ?string $location,
        ?string $resolvedCity,
    ): void {
        $rows->push([
            'Source' => $source,
            'Record ID' => (string) $recordId,
            'Point' => $point,
            'Place ID' => $placeId ?? 'N/A',
            'Existing City' => $existingCity ?? 'N/A',
            'Resolved City' => $resolvedCity ?? 'Not found',
            'Location' => $location ?? '',
        ]);
    }

    /**
     * @param  Collection<int, City>  $cities
     */
    private function resolveCityName(
        GoogleAddressComponentLookupService $lookupService,
        Collection $cities,
        ?string $placeId,
        ?string $location,
    ): ?string {
        try {
            $result = $lookupService->lookup([
                'address' => $placeId ? '' : (string) $location,
                'place_id' => $placeId,
            ]);

            $cityName = $result['components']['city'] ?? null;

            if (filled($cityName)) {
                return (string) $cityName;
            }
        } catch (Throwable) {
        }

        return $this->inferCityFromText($location, $cities);
    }

    /**
     * @param  Collection<int, City>  $cities
     */
    private function inferCityFromText(?string $location, Collection $cities): ?string
    {
        $haystack = mb_strtolower((string) $location);

        if ($haystack === '') {
            return null;
        }

        foreach ($cities as $city) {
            $cityName = mb_strtolower($city->name);

            if (str_contains($haystack, $cityName)) {
                return $city->name;
            }
        }

        return null;
    }
}
