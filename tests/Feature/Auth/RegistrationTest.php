<?php

use Spatie\Permission\Models\Role;

test('new users can register', function () {
    Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);
    
    // Set up OTP verification in cache (required by the registration controller)
    $email = 'test@example.com';
    $cacheKey = 'signup_otp_' . md5($email);
    \Illuminate\Support\Facades\Cache::put($cacheKey, [
        'verified' => true,
        'identifier' => $email,
    ], now()->addMinutes(10));
    
    $response = $this->postJson('/api/register', [
        'name' => 'Test User',
        'email' => $email,
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'user',
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure(['user']);
});