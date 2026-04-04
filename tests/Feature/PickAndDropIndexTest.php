<?php

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
