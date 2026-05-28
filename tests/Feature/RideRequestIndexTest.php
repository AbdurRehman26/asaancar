<?php

use App\Models\City;
use App\Models\RideRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

const PUBLIC_RIDE_REQUEST_CITY_ID = 197;

it('orders ride requests by the closest start and end coordinates when provided', function () {
    $city = City::query()->forceCreate(['id' => PUBLIC_RIDE_REQUEST_CITY_ID, 'name' => 'Karachi']);
    $user = User::factory()->create(['city_id' => $city->id]);

    $closestRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'city_id' => $city->id,
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
        'city_id' => $city->id,
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
    $city = City::query()->forceCreate(['id' => PUBLIC_RIDE_REQUEST_CITY_ID, 'name' => 'Karachi']);
    $user = User::factory()->create([
        'city_id' => $city->id,
    ]);

    $olderRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'city_id' => $city->id,
        'created_at' => now()->subDay(),
        'updated_at' => now()->subDay(),
    ]);

    $latestRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'city_id' => $city->id,
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

it('only lists public city ride requests for city id 197', function () {
    $karachi = City::query()->forceCreate(['id' => PUBLIC_RIDE_REQUEST_CITY_ID, 'name' => 'Karachi']);
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

    RideRequest::factory()->create([
        'user_id' => $karachiUser->id,
        'city_id' => null,
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/ride-requests?city_id='.$lahore->id);

    $response->assertSuccessful();

    expect(collect($response->json('data'))->pluck('id')->all())->toEqualCanonicalizing([
        $karachiRequest->id,
    ])
        ->and($response->json('data.0.city_name'))->toBe('Karachi');
});

it('prioritizes exact location matches when searching ride requests', function () {
    $city = City::query()->forceCreate(['id' => PUBLIC_RIDE_REQUEST_CITY_ID, 'name' => 'Karachi']);
    $user = User::factory()->create(['city_id' => $city->id]);

    $exactRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'city_id' => $city->id,
        'start_location' => 'DHA',
        'is_active' => true,
    ]);

    RideRequest::factory()->create([
        'user_id' => $user->id,
        'city_id' => $city->id,
        'start_location' => 'DHA Phase 8, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/ride-requests?start_location=DHA');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($exactRequest->id);
});

it('falls back to partial location matches when searching ride requests has no exact match', function () {
    $city = City::query()->forceCreate(['id' => PUBLIC_RIDE_REQUEST_CITY_ID, 'name' => 'Karachi']);
    $user = User::factory()->create(['city_id' => $city->id]);

    $matchingRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'city_id' => $city->id,
        'end_location' => 'Clifton Block 2, Karachi',
        'is_active' => true,
    ]);

    RideRequest::factory()->create([
        'user_id' => $user->id,
        'city_id' => $city->id,
        'end_location' => 'Gulshan-e-Iqbal, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/ride-requests?end_location=Block');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($matchingRequest->id);
});

it('searches split route text across location fields for ride requests', function () {
    $city = City::query()->forceCreate(['id' => PUBLIC_RIDE_REQUEST_CITY_ID, 'name' => 'Karachi']);
    $user = User::factory()->create(['city_id' => $city->id]);

    $matchingRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'city_id' => $city->id,
        'start_location' => 'Khayaban-e-Ittehad, Karachi',
        'is_active' => true,
    ]);

    RideRequest::factory()->create([
        'user_id' => $user->id,
        'city_id' => $city->id,
        'start_location' => 'University Road, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/ride-requests?start_location=Ittehad Karachi');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($matchingRequest->id);
});

it('searches end route fields when only start location is provided for ride requests', function () {
    $city = City::query()->forceCreate(['id' => PUBLIC_RIDE_REQUEST_CITY_ID, 'name' => 'Karachi']);
    $user = User::factory()->create(['city_id' => $city->id]);

    $matchingRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'city_id' => $city->id,
        'start_location' => 'University Road, Karachi',
        'end_location' => 'Sea View Road, Karachi',
        'is_active' => true,
    ]);

    RideRequest::factory()->create([
        'user_id' => $user->id,
        'city_id' => $city->id,
        'start_location' => 'Khayaban-e-Ittehad, Karachi',
        'end_location' => 'Five Star Chowrangi, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/ride-requests?start_location=Sea+View');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($matchingRequest->id);
});

it('searches saved start and end area text columns for ride requests', function () {
    $city = City::query()->forceCreate(['id' => PUBLIC_RIDE_REQUEST_CITY_ID, 'name' => 'Karachi']);
    $user = User::factory()->create(['city_id' => $city->id]);

    RideRequest::factory()->create([
        'user_id' => $user->id,
        'city_id' => $city->id,
        'start_area' => 'DHA Phase 1',
        'start_location' => 'DHA Phase 1, Karachi',
        'end_location' => 'Gulshan-e-Iqbal, Karachi',
        'is_active' => true,
    ]);

    $matchingRequest = RideRequest::factory()->create([
        'user_id' => $user->id,
        'city_id' => $city->id,
        'start_location' => 'University Road, Karachi',
        'end_area' => 'DHA Phase 6',
        'end_location' => 'DHA Phase 6, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/ride-requests?start_location=DHA+PHASE+6');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($matchingRequest->id);
});
