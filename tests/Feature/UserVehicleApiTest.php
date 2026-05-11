<?php

use App\Models\User;
use App\Models\UserVehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lists only the authenticated users vehicles with default first', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $olderDefaultVehicle = UserVehicle::factory()->create([
        'user_id' => $user->id,
        'vehicle_type' => 'car',
        'brand' => 'Toyota',
        'is_default' => true,
    ]);

    $newerSecondaryVehicle = UserVehicle::factory()->create([
        'user_id' => $user->id,
        'vehicle_type' => 'bike',
        'brand' => 'Honda',
        'is_default' => false,
    ]);

    UserVehicle::factory()->create([
        'user_id' => $otherUser->id,
        'brand' => 'Suzuki',
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/user/vehicles');

    $response->assertSuccessful()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $olderDefaultVehicle->id)
        ->assertJsonPath('data.0.is_default', true)
        ->assertJsonPath('data.1.id', $newerSecondaryVehicle->id);
});

it('creates the first saved vehicle as default automatically', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/user/vehicles', [
            'vehicle_type' => 'car',
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'color' => 'White',
            'seats' => 4,
            'transmission' => 'automatic',
            'fuel_type' => 'petrol',
        ]);

    $response->assertCreated()
        ->assertJsonPath('message', 'Vehicle saved successfully.')
        ->assertJsonPath('data.vehicle_type', 'car')
        ->assertJsonPath('data.is_default', true);

    $this->assertDatabaseHas('user_vehicles', [
        'user_id' => $user->id,
        'brand' => 'Toyota',
        'is_default' => true,
    ]);
});

it('resets existing defaults when saving a new default vehicle', function () {
    $user = User::factory()->create();

    $existingVehicle = UserVehicle::factory()->create([
        'user_id' => $user->id,
        'vehicle_type' => 'car',
        'brand' => 'Suzuki',
        'is_default' => true,
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/user/vehicles', [
            'vehicle_type' => 'bike',
            'brand' => 'Honda',
            'model' => 'CB 125',
            'is_default' => true,
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.is_default', true);

    expect($existingVehicle->fresh()->is_default)->toBeFalse();

    $this->assertDatabaseHas('user_vehicles', [
        'user_id' => $user->id,
        'brand' => 'Honda',
        'is_default' => true,
    ]);
});

it('validates the vehicle payload', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/user/vehicles', [
            'vehicle_type' => 'truck',
            'seats' => 0,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['vehicle_type', 'seats']);
});
