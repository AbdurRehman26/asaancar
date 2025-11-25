<?php

use App\Models\User;

// Login is handled through modals, no separate login page exists
// test('login screen can be rendered', function () {
//     $response = $this->get('/login');
//     $response->assertStatus(200);
// });

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/login', [
        'login_method' => 'password',
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure(['token', 'user']);
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/login', [
        'login_method' => 'password',
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(401);
    $response->assertJsonStructure(['message']);
});

test('users can logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('api-token')->plainTextToken;

    $response = $this->withHeader('Authorization', 'Bearer ' . $token)
        ->postJson('/api/logout');

    $response->assertStatus(200);
    $response->assertJsonStructure(['message']);
});