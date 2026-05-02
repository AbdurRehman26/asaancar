<?php

use App\Models\City;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('updates the authenticated users gender and city', function () {
    $user = User::factory()->create([
        'gender' => null,
        'city_id' => null,
    ]);
    $city = City::factory()->create();

    $response = $this->actingAs($user)->patchJson('/api/user', [
        'gender' => 'male',
        'city_id' => $city->id,
    ]);

    $response->assertSuccessful()
        ->assertJsonPath('message', 'User profile updated successfully.')
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.gender', 'male')
        ->assertJsonPath('data.city_id', $city->id)
        ->assertJsonPath('data.city.id', $city->id)
        ->assertJsonPath('data.city.name', $city->name);

    expect($user->fresh()->gender)->toBe('male')
        ->and($user->fresh()->city_id)->toBe($city->id);
});

it('allows clearing the authenticated users gender and city', function () {
    $city = City::factory()->create();
    $user = User::factory()->create([
        'gender' => 'female',
        'city_id' => $city->id,
    ]);

    $response = $this->actingAs($user)->patchJson('/api/user', [
        'gender' => null,
        'city_id' => null,
    ]);

    $response->assertSuccessful()
        ->assertJsonPath('data.gender', null)
        ->assertJsonPath('data.city_id', null);

    expect($user->fresh()->gender)->toBeNull()
        ->and($user->fresh()->city_id)->toBeNull();
});

it('validates gender and city_id when updating the authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patchJson('/api/user', [
        'gender' => 'other',
        'city_id' => 999999,
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['gender', 'city_id']);
});

it('requires authentication to update the user profile', function () {
    $this->patchJson('/api/user', [
        'gender' => 'male',
    ])->assertUnauthorized();
});
