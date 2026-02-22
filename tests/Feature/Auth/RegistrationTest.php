<?php

use Spatie\Permission\Models\Role;

test('new users can register', function () {
    // Create the customer role (assigned by the registration controller)
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
    
    // Set up OTP verification in cache (required by the registration controller)
    $phoneNumber = '+923001234567';
    $cacheKey = 'signup_otp_' . md5($phoneNumber);
    \Illuminate\Support\Facades\Cache::put($cacheKey, [
        'verified' => true,
        'identifier' => $phoneNumber,
        'is_email' => false,
    ], now()->addMinutes(10));
    
    $response = $this->postJson('/api/register', [
        'name' => 'Test User',
        'phone_number' => $phoneNumber,
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure(['user']);
});