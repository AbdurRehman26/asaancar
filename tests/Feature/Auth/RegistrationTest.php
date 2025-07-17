<?php

use Spatie\Permission\Models\Role;

test('new users can register', function () {
    Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);
    $response = $this->postJson('/api/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'user',
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure(['user']);
});