<?php

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
    $user = User::factory()->create();

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
        ->and($response->json('data.1.id'))->toBe($olderRequest->id);
});
