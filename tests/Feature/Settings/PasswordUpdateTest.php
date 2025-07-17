<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('password can be updated', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user, 'sanctum')->putJson('/api/settings/password', [
        'current_password' => 'password',
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ]);
    $response->assertStatus(200);
    $response->assertJsonStructure(['message']);
    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

test('correct password must be provided to update password', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user, 'sanctum')->putJson('/api/settings/password', [
        'current_password' => 'wrong-password',
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ]);
    $response->assertStatus(422);
    $response->assertJsonStructure(['message']);
});