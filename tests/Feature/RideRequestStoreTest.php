<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('creates a ride request with separate departure date and time', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/customer/ride-requests', [
            'name' => 'Sarah',
            'contact' => '+923001112233',
            'start_location' => 'Lahore, Pakistan',
            'start_place_id' => 'place_start_123',
            'start_latitude' => 31.5204,
            'start_longitude' => 74.3587,
            'end_location' => 'Karachi, Pakistan',
            'end_place_id' => 'place_end_456',
            'end_latitude' => 24.8607,
            'end_longitude' => 67.0011,
            'departure_date' => '2026-04-25',
            'departure_time' => '08:30',
            'required_seats' => 2,
            'preferred_driver_gender' => 'female',
            'budget_per_seat' => 1200,
            'description' => 'Need a comfortable morning ride.',
        ]);

    $response->assertSuccessful()
        ->assertJsonPath('data.required_seats', 2)
        ->assertJsonPath('data.preferred_driver_gender', 'female');

    $this->assertDatabaseHas('ride_requests', [
        'user_id' => $this->user->id,
        'start_place_id' => 'place_start_123',
        'end_place_id' => 'place_end_456',
        'departure_time' => '2026-04-25 08:30:00',
        'required_seats' => 2,
        'preferred_driver_gender' => 'female',
    ]);
});

it('does not require departure date when schedule type is not once', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/customer/ride-requests', [
            'start_location' => 'Islamabad, Pakistan',
            'end_location' => 'Rawalpindi, Pakistan',
            'departure_time' => '09:15',
            'schedule_type' => 'everyday',
            'required_seats' => 1,
            'preferred_driver_gender' => 'any',
        ]);

    $response->assertSuccessful();

    $this->assertDatabaseHas('ride_requests', [
        'user_id' => $this->user->id,
        'schedule_type' => 'everyday',
        'departure_time' => '2000-01-01 09:15:00',
    ]);
});

it('requires departure date when schedule type is once', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/customer/ride-requests', [
            'start_location' => 'Islamabad, Pakistan',
            'end_location' => 'Rawalpindi, Pakistan',
            'departure_time' => '09:15',
            'schedule_type' => 'once',
            'required_seats' => 1,
            'preferred_driver_gender' => 'any',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['departure_date']);
});

it('caps seats needed at four', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/customer/ride-requests', [
            'start_location' => 'Islamabad, Pakistan',
            'end_location' => 'Rawalpindi, Pakistan',
            'departure_date' => '2026-04-25',
            'departure_time' => '09:15',
            'required_seats' => 5,
            'preferred_driver_gender' => 'any',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['required_seats']);
});
