<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->getJson('/api/dashboard');
    $response->assertStatus(401); // Unauthenticated
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create(), 'sanctum');
    $response = $this->getJson('/api/dashboard');
    $response->assertStatus(200);
});