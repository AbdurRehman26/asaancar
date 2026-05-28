<?php

use App\Models\Area;
use App\Models\City;
use App\Models\PickAndDrop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('orders services by the closest start and end coordinates when provided', function () {
    $user = User::factory()->create();

    $closestService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
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
    $city = City::create(['name' => 'Karachi']);
    $startArea = Area::factory()->create(['city_id' => $city->id, 'name' => 'DHA Phase 8']);
    $endArea = Area::factory()->create(['city_id' => $city->id, 'name' => 'Clifton']);
    $user = User::factory()->create([
        'city_id' => $city->id,
    ]);

    $systemGeneratedService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'start_location' => 'System Generated Route',
        'departure_time' => '2026-04-15 08:00:00',
        'is_active' => true,
        'is_system_generated' => true,
    ]);

    $manualService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
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

it('filters pick and drop services by user city id', function () {
    $karachi = City::create(['name' => 'Karachi']);
    $lahore = City::create(['name' => 'Lahore']);

    $karachiUser = User::factory()->create([
        'city_id' => $karachi->id,
    ]);

    $lahoreUser = User::factory()->create([
        'city_id' => $lahore->id,
    ]);

    $karachiService = PickAndDrop::factory()->create([
        'user_id' => $karachiUser->id,
        'is_active' => true,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $lahoreUser->id,
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/pick-and-drop?city_id='.$karachi->id);

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($karachiService->id)
        ->and($response->json('data.0.city_name'))->toBe('Karachi');
});

it('prioritizes exact area matches when searching pick and drop services by area', function () {
    $user = User::factory()->create();

    $exactService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'start_area' => 'DHA',
        'start_location' => 'DHA Phase 8, Karachi',
        'is_active' => true,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'start_area' => 'DHA Phase 8',
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

    $matchingService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'end_area' => 'Clifton Block 2',
        'end_location' => 'Clifton Block 2, Karachi',
        'is_active' => true,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'end_area' => 'Gulshan-e-Iqbal',
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

    $matchingService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'start_area' => 'DHA Phase 8',
        'start_location' => 'Khayaban-e-Ittehad, Karachi',
        'is_active' => true,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'start_area' => 'Gulshan-e-Iqbal',
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

    $matchingService = PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'start_area' => 'Gulshan-e-Iqbal',
        'start_location' => 'University Road, Karachi',
        'end_area' => 'Clifton Block 5',
        'end_location' => 'Sea View Road, Karachi',
        'is_active' => true,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $user->id,
        'start_area' => 'DHA Phase 8',
        'start_location' => 'Khayaban-e-Ittehad, Karachi',
        'end_area' => 'North Nazimabad',
        'end_location' => 'Five Star Chowrangi, Karachi',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/pick-and-drop?start_location=Clifton');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($matchingService->id);
});
