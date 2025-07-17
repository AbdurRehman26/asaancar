<?php

use App\Models\User;

test('profile page is displayed', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user, 'sanctum')->getJson('/api/user');
    $response->assertStatus(200);
    $response->assertJsonStructure(['data' => ['id', 'name', 'email']]);
});

test('profile information can be updated', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user, 'sanctum')->patchJson('/api/settings/profile', [
        'name' => 'Test User',
        'email' => 'test@example.com',
    ]);
    $response->assertStatus(200);
    $response->assertJsonStructure(['user']);
    $user->refresh();
    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $response = $this->actingAs($user, 'sanctum')->patchJson('/api/settings/profile', [
        'name' => 'Test User',
        'email' => $user->email,
    ]);
    $response->assertStatus(200);
    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user, 'sanctum')->deleteJson('/api/settings/profile', [
        'password' => 'password',
    ]);
    $response->assertStatus(200);
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user, 'sanctum')->deleteJson('/api/settings/profile', [
        'password' => 'wrong-password',
    ]);
    $response->assertStatus(422);
    $response->assertJsonStructure(['message']);
    expect($user->fresh())->not->toBeNull();
});