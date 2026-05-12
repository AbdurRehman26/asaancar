<?php

use App\Models\Area;
use App\Models\City;
use App\Models\PickAndDrop;
use App\Models\RideRequest;
use App\Services\GoogleAddressComponentLookupService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('searches matching pick and drop and ride request records for explicit place ids', function () {
    $karachi = City::create(['name' => 'Karachi']);
    $area = Area::create(['name' => 'Clifton', 'city_id' => $karachi->id]);

    PickAndDrop::factory()->create([
        'pickup_city_id' => $karachi->id,
        'pickup_area_id' => $area->id,
        'dropoff_city_id' => $karachi->id,
        'dropoff_area_id' => $area->id,
        'start_place_id' => 'start-place-id',
        'end_place_id' => 'end-place-id',
        'start_location' => 'I. I. Chundrigar Road, Karachi, Pakistan',
        'end_location' => 'Lalazar, Karachi, Pakistan',
    ]);

    RideRequest::factory()->create([
        'start_place_id' => 'start-place-id',
        'end_place_id' => 'end-place-id',
        'start_location' => 'I. I. Chundrigar Road, Karachi, Pakistan',
        'end_location' => 'Lalazar, Karachi, Pakistan',
    ]);

    $this->mock(GoogleAddressComponentLookupService::class, function ($mock): void {
        $mock->shouldReceive('lookup')->times(4)->andReturnUsing(function (array $payload): array {
            return [
                'query' => $payload['address'],
                'place_id' => $payload['place_id'],
                'formatted_address' => 'Karachi, Pakistan',
                'latitude' => null,
                'longitude' => null,
                'components' => [
                    'street_number' => null,
                    'route' => null,
                    'neighborhood' => null,
                    'sublocality' => null,
                    'city' => 'Karachi',
                    'state' => 'Sindh',
                    'country' => 'Pakistan',
                    'postal_code' => null,
                ],
                'address_components' => [],
            ];
        });
    });

    $this->artisan('places:lookup-cities', [
        'start_place_id' => 'start-place-id',
        'end_place_id' => 'end-place-id',
    ])
        ->expectsTable(
            ['Source', 'Record ID', 'Point', 'Place ID', 'Existing City', 'Resolved City', 'Location'],
            [
                ['PickAndDrop', '1', 'Start', 'start-place-id', 'Karachi', 'Karachi', 'I. I. Chundrigar Road, Karachi, Pakistan'],
                ['PickAndDrop', '1', 'End', 'end-place-id', 'Karachi', 'Karachi', 'Lalazar, Karachi, Pakistan'],
                ['RideRequest', '1', 'Start', 'start-place-id', 'N/A', 'Karachi', 'I. I. Chundrigar Road, Karachi, Pakistan'],
                ['RideRequest', '1', 'End', 'end-place-id', 'N/A', 'Karachi', 'Lalazar, Karachi, Pakistan'],
            ]
        )
        ->assertSuccessful();
});

it('scans records missing city ids by default and only resolves those candidates', function () {
    $karachi = City::create(['name' => 'Karachi']);

    PickAndDrop::factory()->create([
        'pickup_city_id' => null,
        'pickup_area_id' => null,
        'dropoff_city_id' => null,
        'dropoff_area_id' => null,
        'start_place_id' => 'missing-start-place',
        'end_place_id' => 'missing-end-place',
        'start_location' => 'DHA Phase 8, Karachi, Pakistan',
        'end_location' => 'Clifton, Karachi, Pakistan',
    ]);

    PickAndDrop::factory()->create([
        'pickup_city_id' => $karachi->id,
        'dropoff_city_id' => $karachi->id,
        'start_place_id' => 'ignored-start-place',
        'end_place_id' => 'ignored-end-place',
        'start_location' => 'Karachi, Pakistan',
        'end_location' => 'Karachi, Pakistan',
    ]);

    RideRequest::factory()->create([
        'start_place_id' => 'request-start-place',
        'end_place_id' => 'request-end-place',
        'start_location' => 'Shahrah-e-Faisal, Karachi, Pakistan',
        'end_location' => 'North Nazimabad, Karachi, Pakistan',
    ]);

    $this->mock(GoogleAddressComponentLookupService::class, function ($mock): void {
        $mock->shouldReceive('lookup')->times(4)->andReturnUsing(function (array $payload): array {
            expect($payload['place_id'])->toBeIn([
                'missing-start-place',
                'missing-end-place',
                'request-start-place',
                'request-end-place',
            ]);

            return [
                'query' => $payload['address'],
                'place_id' => $payload['place_id'],
                'formatted_address' => 'Karachi, Pakistan',
                'latitude' => null,
                'longitude' => null,
                'components' => [
                    'street_number' => null,
                    'route' => null,
                    'neighborhood' => null,
                    'sublocality' => null,
                    'city' => 'Karachi',
                    'state' => 'Sindh',
                    'country' => 'Pakistan',
                    'postal_code' => null,
                ],
                'address_components' => [],
            ];
        });
    });

    $this->artisan('places:lookup-cities')
        ->expectsOutput('Scanning pick and drop services missing pickup/dropoff city IDs...')
        ->expectsOutput('Scanning ride requests for city lookup...')
        ->expectsTable(
            ['Source', 'Record ID', 'Point', 'Place ID', 'Existing City', 'Resolved City', 'Location'],
            [
                ['PickAndDrop', '1', 'Start', 'missing-start-place', 'N/A', 'Karachi', 'DHA Phase 8, Karachi, Pakistan'],
                ['PickAndDrop', '1', 'End', 'missing-end-place', 'N/A', 'Karachi', 'Clifton, Karachi, Pakistan'],
                ['RideRequest', '1', 'Start', 'request-start-place', 'N/A', 'Karachi', 'Shahrah-e-Faisal, Karachi, Pakistan'],
                ['RideRequest', '1', 'End', 'request-end-place', 'N/A', 'Karachi', 'North Nazimabad, Karachi, Pakistan'],
            ]
        )
        ->assertSuccessful();
});
