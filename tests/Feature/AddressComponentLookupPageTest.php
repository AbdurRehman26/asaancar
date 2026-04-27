<?php

use App\Filament\Pages\AddressComponentLookup;
use App\Models\PickAndDrop;
use App\Models\RideRequest;
use App\Models\User;
use App\Services\GoogleAddressComponentLookupService;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;

it('loads the admin address component lookup page', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('filament.admin.pages.address-component-lookup'))
        ->assertSuccessful()
        ->assertSee('Address Component Lookup')
        ->assertSee('Source Type')
        ->assertSee('Load Addresses')
        ->assertSee('Lookup Components');
});

it('saves the selected response fields into start_area and end_area', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $ride = PickAndDrop::factory()->create([
        'start_location' => 'Start Address',
        'start_place_id' => 'start-place-id',
        'start_area' => null,
        'end_location' => 'End Address',
        'end_place_id' => 'end-place-id',
        'end_area' => null,
    ]);

    $this->mock(GoogleAddressComponentLookupService::class, function ($mock): void {
        $mock->shouldReceive('lookup')->twice()->andReturnUsing(function (array $payload): array {
            return match ($payload['place_id']) {
                'start-place-id' => [
                    'query' => '',
                    'place_id' => 'start-place-id',
                    'formatted_address' => 'Start Formatted Address',
                    'latitude' => 24.8607,
                    'longitude' => 67.0011,
                    'components' => [
                        'street_number' => null,
                        'route' => 'Start Route',
                        'sublocality' => 'Start Sublocality',
                        'city' => 'Karachi',
                        'state' => 'Sindh',
                        'country' => 'Pakistan',
                        'postal_code' => '74000',
                    ],
                    'address_components' => [],
                ],
                'end-place-id' => [
                    'query' => '',
                    'place_id' => 'end-place-id',
                    'formatted_address' => 'End Formatted Address',
                    'latitude' => 31.5204,
                    'longitude' => 74.3587,
                    'components' => [
                        'street_number' => null,
                        'route' => 'End Route',
                        'sublocality' => 'End Sublocality',
                        'city' => 'Lahore',
                        'state' => 'Punjab',
                        'country' => 'Pakistan',
                        'postal_code' => '54000',
                    ],
                    'address_components' => [],
                ],
            };
        });
    });

    Livewire::actingAs($admin)
        ->test(AddressComponentLookup::class)
        ->set('sourceType', 'pick_and_drop')
        ->set('recordId', (string) $ride->id)
        ->call('lookupComponents')
        ->set('startAreaField', 'city')
        ->set('endAreaField', 'route')
        ->call('saveSelectedAreaFields');

    $ride->refresh();

    expect($ride->start_area)->toBe('Karachi');
    expect($ride->end_area)->toBe('End Route');
});

it('loads all records for the selected source type into the record selector', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $rideOne = PickAndDrop::factory()->create([
        'start_location' => 'Ride One Start',
        'end_location' => 'Ride One End',
    ]);
    $rideTwo = PickAndDrop::factory()->create([
        'start_location' => 'Ride Two Start',
        'end_location' => 'Ride Two End',
    ]);
    $requestOne = RideRequest::factory()->create([
        'start_location' => 'Request One Start',
        'end_location' => 'Request One End',
    ]);

    $component = Livewire::actingAs($admin)
        ->test(AddressComponentLookup::class)
        ->set('sourceType', 'pick_and_drop')
        ->assertSet('sourceType', 'pick_and_drop');

    $pickAndDropOptions = $component->instance()->getAvailableRecordOptions();

    expect($pickAndDropOptions)->toHaveCount(2);
    expect($pickAndDropOptions[$rideOne->id])->toContain('Ride One Start');
    expect($pickAndDropOptions[$rideTwo->id])->toContain('Ride Two Start');

    $component
        ->set('sourceType', 'ride_request')
        ->assertSet('sourceType', 'ride_request');

    $rideRequestOptions = $component->instance()->getAvailableRecordOptions();

    expect($rideRequestOptions)->toHaveCount(1);
    expect($rideRequestOptions[$requestOne->id])->toContain('Request One Start');
});
