<?php

use App\Models\City;
use App\Models\PickAndDrop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lists users who have at least one active pick and drop service', function () {
    $city = City::create(['name' => 'Karachi']);

    $visibleDriver = User::factory()->create([
        'name' => 'Visible Driver',
        'phone_number' => '03001234567',
        'city_id' => $city->id,
        'gender' => 'female',
    ]);

    $hiddenDriver = User::factory()->create([
        'name' => 'Hidden Driver',
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $visibleDriver->id,
        'start_location' => 'Lyari',
        'end_location' => 'Surjani Town',
        'departure_time' => '2026-05-02 10:00:00',
        'is_active' => true,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $hiddenDriver->id,
        'start_location' => 'DHA',
        'end_location' => 'Clifton',
        'departure_time' => '2026-05-02 11:00:00',
        'is_active' => false,
    ]);

    $response = $this->getJson('/api/drivers');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.name'))->toBe('Visible Driver')
        ->and($response->json('data.0.gender'))->toBe($visibleDriver->gender)
        ->and($response->json('data.0.city_name'))->toBe('Karachi')
        ->and($response->json('data.0.active_services_count'))->toBe(1)
        ->and($response->json('data.0.latest_service.start_location'))->toBe('Lyari')
        ->and($response->json('data.0.phone_number'))->toBeNull();
});

it('filters drivers by city and gender', function () {
    $karachi = City::create(['name' => 'Karachi']);
    $lahore = City::create(['name' => 'Lahore']);

    $matchingDriver = User::factory()->create([
        'name' => 'Karachi Female Driver',
        'city_id' => $karachi->id,
        'gender' => 'female',
    ]);

    $wrongCityDriver = User::factory()->create([
        'name' => 'Lahore Female Driver',
        'city_id' => $lahore->id,
        'gender' => 'female',
    ]);

    $fallbackGenderDriver = User::factory()->create([
        'name' => 'Karachi Fallback Male Driver',
        'city_id' => $karachi->id,
        'gender' => null,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $matchingDriver->id,
        'driver_gender' => 'female',
        'is_active' => true,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $wrongCityDriver->id,
        'driver_gender' => 'female',
        'is_active' => true,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $fallbackGenderDriver->id,
        'driver_gender' => 'male',
        'is_active' => true,
    ]);

    $cityResponse = $this->getJson('/api/drivers?city_id='.$karachi->id);

    $cityResponse->assertSuccessful();

    expect(collect($cityResponse->json('data'))->pluck('name')->all())
        ->toEqualCanonicalizing(['Karachi Fallback Male Driver', 'Karachi Female Driver']);

    $genderResponse = $this->getJson('/api/drivers?gender=female');

    $genderResponse->assertSuccessful();

    expect(collect($genderResponse->json('data'))->pluck('name')->all())
        ->toEqualCanonicalizing(['Lahore Female Driver', 'Karachi Female Driver']);

    $fallbackGenderResponse = $this->getJson('/api/drivers?city_id='.$karachi->id.'&gender=male');

    $fallbackGenderResponse->assertSuccessful();

    expect($fallbackGenderResponse->json('data'))->toHaveCount(1)
        ->and($fallbackGenderResponse->json('data.0.name'))->toBe('Karachi Fallback Male Driver')
        ->and($fallbackGenderResponse->json('data.0.gender'))->toBe('male');
});

it('shows phone numbers in the drivers api for authenticated users', function () {
    $viewer = User::factory()->create();
    $driver = User::factory()->create([
        'phone_number' => '03001234567',
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $driver->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($viewer)->getJson('/api/drivers');

    $response->assertSuccessful();

    expect($response->json('data.0.phone_number'))->toBe('03001234567');
});

it('shows a single driver profile when the user has active rides', function () {
    $city = City::create(['name' => 'Lahore']);

    $driver = User::factory()->create([
        'name' => 'Driver Profile',
        'phone_number' => '03001234567',
        'city_id' => $city->id,
        'gender' => 'female',
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $driver->id,
        'start_location' => 'North Nazimabad',
        'end_location' => 'Gulshan',
        'departure_time' => '2026-05-02 07:30:00',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/drivers/'.$driver->id);

    $response->assertSuccessful();

    expect($response->json('data.name'))->toBe('Driver Profile')
        ->and($response->json('data.gender'))->toBe($driver->gender)
        ->and($response->json('data.city_name'))->toBe('Lahore')
        ->and($response->json('data.active_services_count'))->toBe(1)
        ->and($response->json('data.latest_service.start_location'))->toBe('North Nazimabad')
        ->and($response->json('data.phone_number'))->toBeNull();
});

it('returns not found for a driver profile when there are no active rides', function () {
    $driver = User::factory()->create();

    PickAndDrop::factory()->create([
        'user_id' => $driver->id,
        'is_active' => false,
    ]);

    $this->getJson('/api/drivers/'.$driver->id)->assertNotFound();
});

it('filters the pick and drop listing by user id', function () {
    $firstDriver = User::factory()->create();
    $secondDriver = User::factory()->create();

    $matchingService = PickAndDrop::factory()->create([
        'user_id' => $firstDriver->id,
        'start_location' => 'Malir',
        'departure_time' => '2026-05-02 09:00:00',
        'is_active' => true,
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $secondDriver->id,
        'start_location' => 'Nazimabad',
        'departure_time' => '2026-05-02 08:00:00',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/pick-and-drop?user_id='.$firstDriver->id);

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($matchingService->id);
});
