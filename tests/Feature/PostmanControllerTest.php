<?php

use App\Models\City;
use App\Models\User;
use App\Services\GoogleAddressComponentLookupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

it('creates a pick and drop service from the admin postman tool using a nested user object and resolved place ids', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $karachi = City::create(['name' => 'Karachi']);
    $lahore = City::create(['name' => 'Lahore']);

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

    $response = $this->actingAs($admin)->postJson('/api/admin/postman/execute', [
        'api_type' => 'pick_and_drop',
        'payload' => [
            'user' => [
                'name' => 'Test Driver',
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
        ],
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.start_place_id', 'karachi-airport-place-id')
        ->assertJsonPath('data.end_place_id', 'clifton-beach-place-id')
        ->assertJsonPath('data.pickup_city_id', $karachi->id)
        ->assertJsonPath('data.dropoff_city_id', $lahore->id)
        ->assertJsonPath('data.user.name', 'Test Driver')
        ->assertJsonPath('data.user.phone_number', '+923001234567');

    $createdUser = User::query()->where('phone_number', '+923001234567')->first();

    expect($createdUser)->not->toBeNull()
        ->and($createdUser->name)->toBe('Test Driver')
        ->and($createdUser->gender)->toBe('male')
        ->and($createdUser->city_id)->toBe($karachi->id);

    $this->assertDatabaseHas('pick_and_drop_services', [
        'user_id' => $createdUser->id,
        'start_place_id' => 'karachi-airport-place-id',
        'end_place_id' => 'clifton-beach-place-id',
        'pickup_city_id' => $karachi->id,
        'dropoff_city_id' => $lahore->id,
    ]);
});
