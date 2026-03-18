<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed cities and areas needed for validation
    $city = \App\Models\City::create(['name' => 'Karachi']);
    $area1 = \App\Models\Area::create(['name' => 'Airport', 'city_id' => $city->id]);
    $area2 = \App\Models\Area::create(['name' => 'Clifton', 'city_id' => $city->id]);

    $this->city = $city;
    $this->area1 = $area1;
    $this->area2 = $area2;
    $this->user = User::factory()->create();
});

it('creates a pick and drop service with separate departure_date and departure_time', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/customer/pick-and-drop', [
            'start_location' => 'Karachi Airport',
            'end_location' => 'Clifton Beach',
            'pickup_city_id' => $this->city->id,
            'pickup_area_id' => $this->area1->id,
            'dropoff_city_id' => $this->city->id,
            'dropoff_area_id' => $this->area2->id,
            'departure_date' => '2026-04-15',
            'departure_time' => '14:30',
            'available_spaces' => 4,
            'driver_gender' => 'male',
        ]);

    $response->assertSuccessful();

    $this->assertDatabaseHas('pick_and_drop_services', [
        'user_id' => $this->user->id,
        'departure_time' => '2026-04-15 14:30:00',
    ]);
});

it('validates departure_time must be in 24hr H:i format', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/customer/pick-and-drop', [
            'start_location' => 'Karachi Airport',
            'end_location' => 'Clifton Beach',
            'pickup_city_id' => $this->city->id,
            'pickup_area_id' => $this->area1->id,
            'dropoff_city_id' => $this->city->id,
            'dropoff_area_id' => $this->area2->id,
            'departure_date' => '2026-04-15',
            'departure_time' => '2:30 PM',
            'available_spaces' => 4,
            'driver_gender' => 'male',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['departure_time']);
});

it('validates departure_date must be in Y-m-d format', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/customer/pick-and-drop', [
            'start_location' => 'Karachi Airport',
            'end_location' => 'Clifton Beach',
            'pickup_city_id' => $this->city->id,
            'pickup_area_id' => $this->area1->id,
            'dropoff_city_id' => $this->city->id,
            'dropoff_area_id' => $this->area2->id,
            'departure_date' => '15-04-2026',
            'departure_time' => '14:30',
            'available_spaces' => 4,
            'driver_gender' => 'male',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['departure_date']);
});

it('requires both departure_date and departure_time for store', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/customer/pick-and-drop', [
            'start_location' => 'Karachi Airport',
            'end_location' => 'Clifton Beach',
            'pickup_city_id' => $this->city->id,
            'pickup_area_id' => $this->area1->id,
            'dropoff_city_id' => $this->city->id,
            'dropoff_area_id' => $this->area2->id,
            'available_spaces' => 4,
            'driver_gender' => 'male',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['departure_date', 'departure_time']);
});

it('rejects invalid 24hr time values', function (string $invalidTime) {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/customer/pick-and-drop', [
            'start_location' => 'Karachi Airport',
            'end_location' => 'Clifton Beach',
            'pickup_city_id' => $this->city->id,
            'pickup_area_id' => $this->area1->id,
            'dropoff_city_id' => $this->city->id,
            'dropoff_area_id' => $this->area2->id,
            'departure_date' => '2026-04-15',
            'departure_time' => $invalidTime,
            'available_spaces' => 4,
            'driver_gender' => 'male',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['departure_time']);
})->with([
    '12hr format' => '2:30 PM',
    'full datetime' => '2026-04-15 14:30:00',
    'random string' => 'not-a-time',
    'with seconds' => '14:30:00',
]);
