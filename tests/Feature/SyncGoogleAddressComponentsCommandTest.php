<?php

use App\Models\Area;
use App\Models\City;
use App\Models\PickAndDrop;
use App\Models\RideRequest;
use App\Models\User;
use App\Services\GoogleAddressComponentLookupService;

it('syncs google address components for rides and ride requests', function () {
    $rideOwner = User::factory()->create(['id' => 12]);
    $requestOwner = User::factory()->create(['id' => 13]);

    $pickupCity = City::query()->create(['name' => 'Karachi']);
    $dropoffCity = City::query()->create(['name' => 'Islamabad']);

    $pickupArea = Area::query()->create([
        'city_id' => $pickupCity->id,
        'name' => 'DHA Phase 8',
        'is_active' => true,
    ]);
    $dropoffArea = Area::query()->create([
        'city_id' => $dropoffCity->id,
        'name' => 'Ramna 5',
        'is_active' => true,
    ]);

    $ride = PickAndDrop::factory()->create([
        'user_id' => $rideOwner->id,
        'start_location' => 'Start Ride Address',
        'start_place_id' => 'start-ride-place',
        'start_latitude' => null,
        'start_longitude' => null,
        'start_area' => null,
        'end_location' => 'End Ride Address',
        'end_place_id' => 'end-ride-place',
        'end_latitude' => null,
        'end_longitude' => null,
        'end_area' => null,
        'pickup_city_id' => null,
        'pickup_area_id' => null,
        'dropoff_city_id' => null,
        'dropoff_area_id' => null,
    ]);

    $rideRequest = RideRequest::factory()->create([
        'user_id' => $requestOwner->id,
        'start_location' => 'Start Request Address',
        'start_place_id' => 'start-request-place',
        'start_latitude' => null,
        'start_longitude' => null,
        'start_area' => null,
        'end_location' => 'End Request Address',
        'end_place_id' => 'end-request-place',
        'end_latitude' => null,
        'end_longitude' => null,
        'end_area' => null,
    ]);

    $this->mock(GoogleAddressComponentLookupService::class, function ($mock): void {
        $mock->shouldReceive('lookup')->times(4)->andReturnUsing(function (array $payload): array {
            return match ($payload['place_id']) {
                'start-ride-place' => [
                    'query' => '',
                    'place_id' => 'start-ride-place',
                    'formatted_address' => 'DHA Phase 8, Karachi, Sindh, Pakistan',
                    'latitude' => 24.8138,
                    'longitude' => 67.0332,
                    'components' => [
                        'street_number' => null,
                        'route' => 'Khayaban-e-Ittehad',
                        'sublocality' => 'DHA Phase 8',
                        'city' => 'Karachi',
                        'state' => 'Sindh',
                        'country' => 'Pakistan',
                        'postal_code' => '75500',
                    ],
                    'address_components' => [],
                ],
                'end-ride-place' => [
                    'query' => '',
                    'place_id' => 'end-ride-place',
                    'formatted_address' => 'Ramna 5, Islamabad, ICT, Pakistan',
                    'latitude' => 33.7074,
                    'longitude' => 73.0405,
                    'components' => [
                        'street_number' => null,
                        'route' => 'Diplomatic Enclave',
                        'sublocality' => 'Ramna 5',
                        'city' => 'Islamabad',
                        'state' => 'Islamabad Capital Territory',
                        'country' => 'Pakistan',
                        'postal_code' => '44000',
                    ],
                    'address_components' => [],
                ],
                'start-request-place' => [
                    'query' => '',
                    'place_id' => 'start-request-place',
                    'formatted_address' => 'Gulberg, Lahore, Punjab, Pakistan',
                    'latitude' => 31.5204,
                    'longitude' => 74.3587,
                    'components' => [
                        'street_number' => null,
                        'route' => 'Main Boulevard',
                        'sublocality' => 'Gulberg',
                        'city' => 'Lahore',
                        'state' => 'Punjab',
                        'country' => 'Pakistan',
                        'postal_code' => '54660',
                    ],
                    'address_components' => [],
                ],
                'end-request-place' => [
                    'query' => '',
                    'place_id' => 'end-request-place',
                    'formatted_address' => 'Bahria Town, Rawalpindi, Punjab, Pakistan',
                    'latitude' => 33.5651,
                    'longitude' => 73.1483,
                    'components' => [
                        'street_number' => null,
                        'route' => 'Civic Center Road',
                        'sublocality' => 'Bahria Town',
                        'city' => 'Rawalpindi',
                        'state' => 'Punjab',
                        'country' => 'Pakistan',
                        'postal_code' => '46220',
                    ],
                    'address_components' => [],
                ],
            };
        });
    });

    $this->artisan('addresses:sync-google-components')
        ->expectsOutput('Syncing pick and drop services...')
        ->expectsOutput('Syncing ride requests...')
        ->assertSuccessful();

    $ride->refresh();
    $rideRequest->refresh();

    expect($ride->start_area)->toBe('DHA Phase 8');
    expect($ride->end_area)->toBe('Ramna 5');
    expect($ride->start_place_id)->toBe('start-ride-place');
    expect($ride->end_place_id)->toBe('end-ride-place');
    expect($ride->pickup_city_id)->toBe($pickupCity->id);
    expect($ride->dropoff_city_id)->toBe($dropoffCity->id);
    expect($ride->pickup_area_id)->toBe($pickupArea->id);
    expect($ride->dropoff_area_id)->toBe($dropoffArea->id);

    expect($rideRequest->start_area)->toBe('Gulberg');
    expect($rideRequest->end_area)->toBe('Bahria Town');
    expect($rideRequest->start_place_id)->toBe('start-request-place');
    expect($rideRequest->end_place_id)->toBe('end-request-place');
});

it('skips already synced records unless force is used', function () {
    $ride = PickAndDrop::factory()->create([
        'start_location' => 'Already Synced Start',
        'end_location' => 'Already Synced End',
        'start_area' => 'Existing Start Area',
        'end_area' => 'Existing End Area',
    ]);

    $this->mock(GoogleAddressComponentLookupService::class, function ($mock): void {
        $mock->shouldNotReceive('lookup');
    });

    $this->artisan('addresses:sync-google-components', [
        '--source' => 'pick-and-drop',
    ])->assertSuccessful();

    $ride->refresh();

    expect($ride->start_area)->toBe('Existing Start Area');
    expect($ride->end_area)->toBe('Existing End Area');
});

it('falls back to the saved location text when a google place id is missing', function () {
    $user = User::factory()->create(['id' => 12]);

    $ride = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'start_location' => 'Fallback Start Address',
        'start_place_id' => null,
        'end_location' => 'Fallback End Address',
        'end_place_id' => 'end-place-id',
        'start_area' => null,
        'end_area' => null,
    ]);

    $this->mock(GoogleAddressComponentLookupService::class, function ($mock): void {
        $mock->shouldReceive('lookup')->twice()->andReturnUsing(function (array $payload): array {
            if ($payload['place_id'] === null) {
                expect($payload['address'])->toBe('Fallback Start Address');

                return [
                    'query' => 'Fallback Start Address',
                    'place_id' => 'resolved-start-place',
                    'formatted_address' => 'Fallback Start Address, Karachi, Pakistan',
                    'latitude' => 24.8607,
                    'longitude' => 67.0011,
                    'components' => [
                        'street_number' => null,
                        'route' => 'Fallback Route',
                        'sublocality' => 'Fallback Start Area',
                        'city' => 'Karachi',
                        'state' => 'Sindh',
                        'country' => 'Pakistan',
                        'postal_code' => '74000',
                    ],
                    'address_components' => [],
                ];
            }

            expect($payload['place_id'])->toBe('end-place-id');
            expect($payload['address'])->toBe('');

            return [
                'query' => '',
                'place_id' => 'end-place-id',
                'formatted_address' => 'Fallback End Address, Lahore, Pakistan',
                'latitude' => 31.5204,
                'longitude' => 74.3587,
                'components' => [
                    'street_number' => null,
                    'route' => 'Mall Road',
                    'sublocality' => 'Fallback End Area',
                    'city' => 'Lahore',
                    'state' => 'Punjab',
                    'country' => 'Pakistan',
                    'postal_code' => '54000',
                ],
                'address_components' => [],
            ];
        });
    });

    $this->artisan('addresses:sync-google-components', [
        '--source' => 'pick-and-drop',
        '--force' => true,
    ])
        ->expectsOutput('Syncing pick and drop services...')
        ->assertSuccessful();

    $ride->refresh();

    expect($ride->start_area)->toBe('Fallback Start Area');
    expect($ride->start_place_id)->toBe('resolved-start-place');
    expect($ride->end_area)->toBe('Fallback End Area');
});

it('skips rides and ride requests owned by users with ids from 1 to 11', function () {
    User::factory()->create(['id' => 1]);
    User::factory()->create(['id' => 11]);

    $ride = PickAndDrop::factory()->create([
        'user_id' => 1,
        'start_place_id' => 'start-ride-place',
        'end_place_id' => 'end-ride-place',
        'start_area' => null,
        'end_area' => null,
    ]);

    $rideRequest = RideRequest::factory()->create([
        'user_id' => 11,
        'start_place_id' => 'start-request-place',
        'end_place_id' => 'end-request-place',
        'start_area' => null,
        'end_area' => null,
    ]);

    $this->mock(GoogleAddressComponentLookupService::class, function ($mock): void {
        $mock->shouldNotReceive('lookup');
    });

    $this->artisan('addresses:sync-google-components', [
        '--force' => true,
    ])->assertSuccessful();

    $ride->refresh();
    $rideRequest->refresh();

    expect($ride->start_area)->toBeNull();
    expect($ride->end_area)->toBeNull();
    expect($rideRequest->start_area)->toBeNull();
    expect($rideRequest->end_area)->toBeNull();
});
