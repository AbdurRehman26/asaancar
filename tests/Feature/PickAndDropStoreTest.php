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

it('stores google places data without requiring area selections', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/customer/pick-and-drop', [
            'start_location' => 'Karachi Airport, Karachi, Pakistan',
            'start_place_id' => 'place_start_123',
            'start_latitude' => 24.906547,
            'start_longitude' => 67.160797,
            'end_location' => 'Clifton Block 5, Karachi, Pakistan',
            'end_place_id' => 'place_end_456',
            'end_latitude' => 24.813829,
            'end_longitude' => 67.029373,
            'departure_date' => '2026-04-15',
            'departure_time' => '14:30',
            'available_spaces' => 4,
            'driver_gender' => 'male',
            'stops' => [
                [
                    'location' => 'Teen Talwar, Karachi, Pakistan',
                    'place_id' => 'place_stop_789',
                    'latitude' => 24.821503,
                    'longitude' => 67.030828,
                    'stop_time' => '2026-04-15 15:00:00',
                    'order' => 0,
                ],
            ],
        ]);

    $response->assertSuccessful();

    $this->assertDatabaseHas('pick_and_drop_services', [
        'user_id' => $this->user->id,
        'start_place_id' => 'place_start_123',
        'end_place_id' => 'place_end_456',
        'pickup_area_id' => null,
        'dropoff_area_id' => null,
    ]);

    $this->assertDatabaseHas('pick_and_drop_stops', [
        'location' => 'Teen Talwar, Karachi, Pakistan',
        'place_id' => 'place_stop_789',
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

it('does not require departure_date when schedule_type is not once', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/customer/pick-and-drop', [
            'start_location' => 'Karachi Airport',
            'end_location' => 'Clifton Beach',
            'pickup_city_id' => $this->city->id,
            'pickup_area_id' => $this->area1->id,
            'dropoff_city_id' => $this->city->id,
            'dropoff_area_id' => $this->area2->id,
            'departure_time' => '14:30',
            'available_spaces' => 4,
            'driver_gender' => 'male',
            'schedule_type' => 'everyday',
        ]);

    $response->assertSuccessful();

    $this->assertDatabaseHas('pick_and_drop_services', [
        'user_id' => $this->user->id,
        'schedule_type' => 'everyday',
        'departure_time' => '2000-01-01 14:30:00',
        'is_system_generated' => false,
    ]);
});

it('defaults is_system_generated to false when creating a service', function () {
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

    $response->assertSuccessful()
        ->assertJsonPath('data.is_system_generated', false);

    $this->assertDatabaseHas('pick_and_drop_services', [
        'user_id' => $this->user->id,
        'is_system_generated' => false,
    ]);
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
