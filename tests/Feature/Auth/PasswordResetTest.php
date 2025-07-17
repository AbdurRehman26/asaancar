<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

test('reset password link can be requested', function () {
    Notification::fake();
    $user = User::factory()->create();
    $response = $this->postJson('/api/forgot-password', ['email' => $user->email]);
    $response->assertStatus(200);
    Notification::assertSentTo($user, ResetPassword::class);
});

test('password can be reset with valid token', function () {
    Notification::fake();
    $user = User::factory()->create();
    $this->postJson('/api/forgot-password', ['email' => $user->email]);
    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
        $response = $this->postJson('/api/reset-password', [
            'token' => $notification->token,
            'email' => $user->email,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);
        $response->assertStatus(200);
        $response->assertJsonStructure(['message']);
        return true;
    });
});