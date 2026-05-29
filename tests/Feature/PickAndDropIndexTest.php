<?php

use App\Models\Area;
use App\Models\City;
use App\Models\PickAndDrop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

const PUBLIC_PICK_AND_DROP_CITY_ID = 197;

beforeEach(function () {
    $this->publicCity = City::query()->forceCreate(['id' => PUBLIC_PICK_AND_DROP_CITY_ID, 'name' => 'Karachi']);
});

it('orders services by the closest start and end coordinates when provided', function () {
    $user = User::factory()->create();

    $closestService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'start_location' => 'Lahore, Pakistan',
        'start_latitude' => 31.5204,
        'start_longitude' => 74.3587,
        'end_location' => 'Karachi, Pakistan',
        'end_latitude' => 24.8607,
        'end_longitude' => 67.0011,
        'departure_time' => '2026-04-15 09:00:00',
        'is_active' => true,
    ]);

    $fartherService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'start_location' => 'Islamabad, Pakistan',
        'start_latitude' => 33.6844,
        'start_longitude' => 73.0479,
        'end_location' => 'Hyderabad, Pakistan',
        'end_latitude' => 25.3960,
        'end_longitude' => 68.3578,
        'departure_time' => '2026-04-15 08:30:00',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/pick-and-drop?start_location=Lahore%2C+Pakistan&start_latitude=31.5204&start_longitude=74.3587&end_location=Karachi%2C+Pakistan&end_latitude=24.8607&end_longitude=67.0011');

    $response->assertSuccessful();

    expect($response->json('data.0.id'))->toBe($closestService->id)
        ->and($response->json('data.1.id'))->toBe($fartherService->id);
});

it('shows non-system-generated services before system-generated services', function () {
    $startArea = Area::factory()->create(['city_id' => $this->publicCity->id, 'name' => 'DHA Phase 8']);
    $endArea = Area::factory()->create(['city_id' => $this->publicCity->id, 'name' => 'Clifton']);
    $user = User::factory()->create([
        'city_id' => $this->publicCity->id,
    ]);

    $systemGeneratedService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'start_location' => 'System Generated Route',
        'departure_time' => '2026-04-15 08:00:00',
        'is_active' => true,
        'is_system_generated' => true,
    ]);

    $manualService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'start_location' => 'Manual Route',
        'start_area' => null,
        'pickup_area_id' => $startArea->id,
        'end_area' => null,
        'dropoff_area_id' => $endArea->id,
        'departure_time' => '2026-04-15 09:00:00',
        'is_active' => true,
        'is_system_generated' => false,
    ]);

    $response = $this->getJson('/api/pick-and-drop?per_page=6');

    $response->assertSuccessful();

    expect($response->json('data.0.id'))->toBe($manualService->id)
        ->and($response->json('data.0.start_area'))->toBe('DHA Phase 8')
        ->and($response->json('data.0.end_area'))->toBe('Clifton')
        ->and($response->json('data.0.city_name'))->toBe('Karachi')
        ->and($response->json('data.0.user.city_name'))->toBe('Karachi')
        ->and($response->json('data.1.id'))->toBe($systemGeneratedService->id);
});

it('only lists pick and drop services for city id 197', function () {
    $karachi = $this->publicCity;
    $lahore = City::create(['name' => 'Lahore']);

    $karachiUser = User::factory()->create([
        'city_id' => $karachi->id,
    ]);

    $lahoreUser = User::factory()->create([
        'city_id' => $lahore->id,
    ]);

    $karachiService = PickAndDrop::factory()->create([
        'user_id' => $karachiUser->id,
        'pickup_city_id' => $karachi->id,
        'dropoff_city_id' => $karachi->id,
        'is_active' => true,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $lahoreUser->id,
        'pickup_city_id' => $lahore->id,
        'dropoff_city_id' => $lahore->id,
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/pick-and-drop?city_id='.$lahore->id);

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($karachiService->id)
        ->and($response->json('data.0.city_name'))->toBe('Karachi');
});

it('prioritizes exact area matches when searching pick and drop services by area', function () {
    $user = User::factory()->create();
    $exactArea = Area::factory()->create(['name' => 'DHA']);
    $partialArea = Area::factory()->create(['name' => 'DHA Phase 8']);

    $exactService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'pickup_area_id' => $exactArea->id,
        'start_location' => 'DHA Phase 8, Karachi',
        'is_active' => true,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'pickup_area_id' => $partialArea->id,
        'start_location' => 'DHA Phase 8, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/pick-and-drop?start_location=DHA');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($exactService->id);
});

it('falls back to partial area matches when searching pick and drop services has no exact match', function () {
    $user = User::factory()->create();
    $matchingArea = Area::factory()->create(['name' => 'Clifton Block 2']);
    $otherArea = Area::factory()->create(['name' => 'Gulshan-e-Iqbal']);

    $matchingService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'dropoff_area_id' => $matchingArea->id,
        'end_location' => 'Clifton Block 2, Karachi',
        'is_active' => true,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'dropoff_area_id' => $otherArea->id,
        'end_location' => 'Gulshan-e-Iqbal, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/pick-and-drop?end_location=Block');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($matchingService->id);
});

it('searches split route text across area and location fields for pick and drop services', function () {
    $user = User::factory()->create();
    $matchingArea = Area::factory()->create(['name' => 'DHA Phase 8']);
    $otherArea = Area::factory()->create(['name' => 'Gulshan-e-Iqbal']);

    $matchingService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'pickup_area_id' => $matchingArea->id,
        'start_location' => 'Khayaban-e-Ittehad, Karachi',
        'is_active' => true,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'pickup_area_id' => $otherArea->id,
        'start_location' => 'University Road, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/pick-and-drop?start_location=Ittehad Karachi');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($matchingService->id);
});

it('searches end route fields when only start location is provided for pick and drop services', function () {
    $user = User::factory()->create();
    $matchingArea = Area::factory()->create(['name' => 'Clifton Block 5']);
    $otherArea = Area::factory()->create(['name' => 'North Nazimabad']);

    $matchingService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'start_location' => 'University Road, Karachi',
        'dropoff_area_id' => $matchingArea->id,
        'end_location' => 'Sea View Road, Karachi',
        'is_active' => true,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'start_location' => 'Khayaban-e-Ittehad, Karachi',
        'dropoff_area_id' => $otherArea->id,
        'end_location' => 'Five Star Chowrangi, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/pick-and-drop?start_location=Clifton');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($matchingService->id);
});

it('prioritizes opposite side exact area matches over intended side token matches for pick and drop services', function () {
    $user = User::factory()->create();
    $weakStartArea = Area::factory()->create(['name' => 'DHA Phase 1']);
    $exactEndArea = Area::factory()->create(['name' => 'DHA Phase 6']);

    PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'pickup_area_id' => $weakStartArea->id,
        'start_location' => 'DHA Phase 1, Karachi',
        'end_location' => 'Gulshan-e-Iqbal, Karachi',
        'is_active' => true,
    ]);

    $matchingService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'start_location' => 'University Road, Karachi',
        'dropoff_area_id' => $exactEndArea->id,
        'end_location' => 'DHA Phase 6, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/pick-and-drop?start_location=DHA+PHASE+6');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($matchingService->id);
});

it('searches saved start and end area text columns for pick and drop services', function () {
    $user = User::factory()->create();

    PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'start_area' => 'DHA Phase 1',
        'start_location' => 'DHA Phase 1, Karachi',
        'end_location' => 'Gulshan-e-Iqbal, Karachi',
        'is_active' => true,
    ]);

    $matchingService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'pickup_city_id' => $this->publicCity->id,
        'dropoff_city_id' => $this->publicCity->id,
        'start_location' => 'University Road, Karachi',
        'end_area' => 'DHA Phase 6',
        'end_location' => 'DHA Phase 6, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/pick-and-drop?start_location=DHA+PHASE+6');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($matchingService->id);
});
