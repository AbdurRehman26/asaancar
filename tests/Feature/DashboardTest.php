<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->getJson('/api/dashboard');
    $response->assertStatus(401); // Unauthenticated
});

test('authenticated users can visit the dashboard', function () {
    // Create the store_owner role if it doesn't exist
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'store_owner', 'guard_name' => 'web']);
    
    $user = User::factory()->create();
    // Assign store_owner role to the user
    $user->assignRole('store_owner');
    
    $this->actingAs($user, 'sanctum');
    $response = $this->getJson('/api/dashboard');
    $response->assertStatus(200);
});