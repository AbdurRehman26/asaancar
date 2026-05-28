<?php

use App\Models\City;
use App\Models\RideRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('orders ride requests by the closest start and end coordinates when provided', function () {
    $user = User::factory()->create();

    $closestRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'start_location' => 'Lahore, Pakistan',
        'start_latitude' => 31.5204,
        'start_longitude' => 74.3587,
        'end_location' => 'Karachi, Pakistan',
        'end_latitude' => 24.8607,
        'end_longitude' => 67.0011,
        'departure_time' => '2026-04-25 09:00:00',
        'is_active' => true,
    ]);

    $fartherRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'start_location' => 'Islamabad, Pakistan',
        'start_latitude' => 33.6844,
        'start_longitude' => 73.0479,
        'end_location' => 'Hyderabad, Pakistan',
        'end_latitude' => 25.3960,
        'end_longitude' => 68.3578,
        'departure_time' => '2026-04-25 08:30:00',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/ride-requests?start_location=Lahore%2C+Pakistan&start_latitude=31.5204&start_longitude=74.3587&end_location=Karachi%2C+Pakistan&end_latitude=24.8607&end_longitude=67.0011');

    $response->assertSuccessful();

    expect($response->json('data.0.id'))->toBe($closestRequest->id)
        ->and($response->json('data.1.id'))->toBe($fartherRequest->id);
});

it('shows latest ride requests first when coordinates are not provided', function () {
    $city = City::create(['name' => 'Karachi']);
    $user = User::factory()->create([
        'city_id' => $city->id,
    ]);

    $olderRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'created_at' => now()->subDay(),
        'updated_at' => now()->subDay(),
    ]);

    $latestRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $response = $this->getJson('/api/ride-requests?per_page=6');

    $response->assertSuccessful();

    expect($response->json('data.0.id'))->toBe($latestRequest->id)
        ->and($response->json('data.0.city_name'))->toBe('Karachi')
        ->and($response->json('data.0.user.city_name'))->toBe('Karachi')
        ->and($response->json('data.1.id'))->toBe($olderRequest->id);
});

it('filters ride requests by ride request city id with requester city fallback', function () {
    $karachi = City::create(['name' => 'Karachi']);
    $lahore = City::create(['name' => 'Lahore']);

    $karachiUser = User::factory()->create([
        'city_id' => $karachi->id,
    ]);

    $lahoreUser = User::factory()->create([
        'city_id' => $lahore->id,
    ]);

    $karachiRequest = RideRequest::factory()->create([
        'user_id' => $karachiUser->id,
        'city_id' => $karachi->id,
        'is_active' => true,
    ]);

    RideRequest::factory()->create([
        'user_id' => $lahoreUser->id,
        'city_id' => $lahore->id,
        'is_active' => true,
    ]);

    RideRequest::factory()->create([
        'user_id' => $karachiUser->id,
        'city_id' => $lahore->id,
        'is_active' => true,
    ]);

    $fallbackRequest = RideRequest::factory()->create([
        'user_id' => $karachiUser->id,
        'city_id' => null,
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/ride-requests?city_id='.$karachi->id);

    $response->assertSuccessful();

    expect(collect($response->json('data'))->pluck('id')->all())->toEqualCanonicalizing([
        $karachiRequest->id,
        $fallbackRequest->id,
    ])
        ->and($response->json('data.0.city_name'))->toBe('Karachi');
});

it('prioritizes exact area matches when searching ride requests by area', function () {
    $user = User::factory()->create();

    $exactRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'start_area' => 'DHA',
        'start_location' => 'DHA Phase 8, Karachi',
        'is_active' => true,
    ]);

    RideRequest::factory()->create([
        'user_id' => $user->id,
        'start_area' => 'DHA Phase 8',
        'start_location' => 'DHA Phase 8, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/ride-requests?start_location=DHA');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($exactRequest->id);
});

it('falls back to partial area matches when searching ride requests has no exact match', function () {
    $user = User::factory()->create();

    $matchingRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'end_area' => 'Clifton Block 2',
        'end_location' => 'Clifton Block 2, Karachi',
        'is_active' => true,
    ]);

    RideRequest::factory()->create([
        'user_id' => $user->id,
        'end_area' => 'Gulshan-e-Iqbal',
        'end_location' => 'Gulshan-e-Iqbal, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/ride-requests?end_location=Block');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($matchingRequest->id);
});

it('searches split route text across area and location fields for ride requests', function () {
    $user = User::factory()->create();

    $matchingRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'start_area' => 'DHA Phase 8',
        'start_location' => 'Khayaban-e-Ittehad, Karachi',
        'is_active' => true,
    ]);

    RideRequest::factory()->create([
        'user_id' => $user->id,
        'start_area' => 'Gulshan-e-Iqbal',
        'start_location' => 'University Road, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/ride-requests?start_location=Ittehad Karachi');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($matchingRequest->id);
});

it('searches end route fields when only start location is provided for ride requests', function () {
    $user = User::factory()->create();

    $matchingRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'start_area' => 'Gulshan-e-Iqbal',
        'start_location' => 'University Road, Karachi',
        'end_area' => 'Clifton Block 5',
        'end_location' => 'Sea View Road, Karachi',
        'is_active' => true,
    ]);

    RideRequest::factory()->create([
        'user_id' => $user->id,
        'start_area' => 'DHA Phase 8',
        'start_location' => 'Khayaban-e-Ittehad, Karachi',
        'end_area' => 'North Nazimabad',
        'end_location' => 'Five Star Chowrangi, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/ride-requests?start_location=Clifton');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($matchingRequest->id);
});
