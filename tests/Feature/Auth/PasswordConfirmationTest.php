<?php

use App\Models\User;

test('password can be confirmed', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user, 'api')->postJson('/api/confirm-password', [
        'password' => 'password',
    ]);
    $response->assertStatus(200);
    $response->assertJsonStructure(['message']);
});

test('password is not confirmed with invalid password', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user, 'api')->postJson('/api/confirm-password', [
        'password' => 'wrong-password',
    ]);
    $response->assertStatus(422);
    $response->assertJsonStructure(['message']);
});