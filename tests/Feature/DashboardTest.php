<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->getJson('/api/dashboard');
    $response->assertStatus(401); // Unauthenticated
});

test('authenticated admins can visit the dashboard', function () {
    // Create the admin role if it doesn't exist
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    
    $user = User::factory()->create();
    // Assign admin role to the user
    $user->assignRole('admin');
    
    $this->actingAs($user, 'sanctum');
    $response = $this->getJson('/api/dashboard');
    $response->assertStatus(200);
});