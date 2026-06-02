<?php

use App\Filament\Pages\ApiTesting;
use App\Models\City;
use App\Models\User;
use App\Services\AdminPickAndDropTestingService;
use App\Services\GoogleAddressComponentLookupService;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;

it('loads the filament api testing page for admins', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('filament.admin.pages.api-testing'))
        ->assertSuccessful()
        ->assertSee('API Testing')
        ->assertSee('JSON Payload')
        ->assertSee('Load Template')
        ->assertSee('Execute Request');
});

it('includes stops in the filament api testing json template', function () {
    $template = app(AdminPickAndDropTestingService::class)->template();

    expect($template)->toHaveKey('stops')
        ->and($template['stops'])->toHaveCount(1)
        ->and($template['stops'][0]['location'])->toBe('Shahrah-e-Faisal')
        ->and($template['stops'][0]['stop_time'])->toBe('2024-12-20 10:20:00');
});

it('executes the pick and drop api test inside filament', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    City::create(['name' => 'Karachi']);
    City::create(['name' => 'Lahore']);

    $this->mock(GoogleAddressComponentLookupService::class, function ($mock): void {
        $mock->shouldReceive('lookup')->twice()->andReturnUsing(function (array $payload): array {
            return match ($payload['address']) {
                'Karachi Airport' => [
                    'query' => 'Karachi Airport',
                    'place_id' => 'karachi-airport-place-id',
                    'formatted_address' => 'Karachi Airport, Karachi, Pakistan',
                    'latitude' => 24.9065,
                    'longitude' => 67.1608,
                    'components' => [
                        'street_number' => null,
                        'route' => null,
                        'neighborhood' => null,
                        'sublocality' => 'Airport',
                        'city' => 'Karachi',
                        'state' => 'Sindh',
                        'country' => 'Pakistan',
                        'postal_code' => null,
                    ],
                    'address_components' => [],
                ],
                'Clifton Beach' => [
                    'query' => 'Clifton Beach',
                    'place_id' => 'clifton-beach-place-id',
                    'formatted_address' => 'Clifton Beach, Lahore, Pakistan',
                    'latitude' => 31.5204,
                    'longitude' => 74.3587,
                    'components' => [
                        'street_number' => null,
                        'route' => null,
                        'neighborhood' => null,
                        'sublocality' => 'Clifton',
                        'city' => 'Lahore',
                        'state' => 'Punjab',
                        'country' => 'Pakistan',
                        'postal_code' => null,
                    ],
                    'address_components' => [],
                ],
                default => throw new RuntimeException('Unexpected lookup'),
            };
        });
    });

    $payload = [
        'user' => [
            'name' => 'Filament Driver',
            'phone_number' => '03001234567',
            'gender' => 'male',
            'city' => 'Karachi',
        ],
        'start_location' => 'Karachi Airport',
        'end_location' => 'Clifton Beach',
        'available_spaces' => 4,
        'driver_gender' => 'male',
        'departure_time' => '2026-05-12 10:00:00',
        'price_per_person' => 500,
        'currency' => 'PKR',
        'is_active' => true,
        'schedule_type' => 'once',
        'stops' => [
            [
                'location' => 'Shahrah-e-Faisal',
                'stop_area' => 'PECHS',
                'stop_time' => '2026-05-12 10:20:00',
                'order' => 0,
                'notes' => 'Optional pickup stop',
            ],
        ],
    ];

    Livewire::actingAs($admin)
        ->test(ApiTesting::class)
        ->set('payloadJson', json_encode($payload, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR))
        ->call('executeRequest')
        ->assertSet('responseStatus', 'success')
        ->assertSet('responseMessage', 'Pick & Drop service created successfully');

    $this->assertDatabaseHas('users', [
        'name' => 'Filament Driver',
        'phone_number' => '+923001234567',
    ]);

    $this->assertDatabaseHas('pick_and_drop_services', [
        'start_place_id' => 'karachi-airport-place-id',
        'end_place_id' => 'clifton-beach-place-id',
    ]);

    $this->assertDatabaseHas('pick_and_drop_stops', [
        'location' => 'Shahrah-e-Faisal',
        'stop_area' => 'PECHS',
        'stop_time' => '2026-05-12 10:20:00',
        'order' => 0,
        'notes' => 'Optional pickup stop',
    ]);
});

it('saves the pick and drop api test when google does not return a response', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->mock(GoogleAddressComponentLookupService::class, function ($mock): void {
        $mock->shouldReceive('lookup')->twice()->andThrow(new RuntimeException('Google did not return a matching address result.'));
    });

    $payload = [
        'user' => [
            'name' => 'Fallback Driver',
            'phone_number' => '03007654321',
            'gender' => 'male',
            'city' => 'Karachi',
        ],
        'start_location' => 'Unresolved Start Address',
        'end_location' => 'Unresolved End Address',
        'available_spaces' => 4,
        'driver_gender' => 'male',
        'departure_time' => '2026-05-12 10:00:00',
        'price_per_person' => 500,
        'currency' => 'PKR',
        'is_active' => true,
        'schedule_type' => 'once',
    ];

    Livewire::actingAs($admin)
        ->test(ApiTesting::class)
        ->set('payloadJson', json_encode($payload, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR))
        ->call('executeRequest')
        ->assertSet('responseStatus', 'success')
        ->assertSet('responseMessage', 'Pick & Drop service created successfully');

    $this->assertDatabaseHas('pick_and_drop_services', [
        'start_location' => 'Unresolved Start Address',
        'end_location' => 'Unresolved End Address',
        'start_place_id' => null,
        'end_place_id' => null,
        'start_latitude' => null,
        'start_longitude' => null,
        'end_latitude' => null,
        'end_longitude' => null,
    ]);
});
