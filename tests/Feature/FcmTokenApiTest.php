<?php

use App\Models\User;
use App\Models\UserFcmToken;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('stores an authenticated users fcm token', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/fcm/tokens', [
        'token' => 'token_123',
        'device_name' => 'Samsung Galaxy S24',
        'platform' => 'android',
        'app_version' => '1.0.0',
    ]);

    $response->assertSuccessful()
        ->assertJson([
            'data' => [
                'token' => 'token_123',
                'device_name' => 'Samsung Galaxy S24',
                'platform' => 'android',
                'app_version' => '1.0.0',
            ],
            'message' => 'FCM token saved successfully.',
        ]);

    $this->assertDatabaseHas('user_fcm_tokens', [
        'user_id' => $user->id,
        'token' => 'token_123',
        'device_name' => 'Samsung Galaxy S24',
        'platform' => 'android',
        'app_version' => '1.0.0',
    ]);
});

it('reassigns an existing token to the authenticated user and updates metadata', function () {
    $originalOwner = User::factory()->create();
    $newOwner = User::factory()->create();

    $token = UserFcmToken::factory()->create([
        'user_id' => $originalOwner->id,
        'token' => 'token_123',
        'device_name' => 'Old Device',
        'platform' => 'android',
        'app_version' => '0.9.0',
    ]);

    $response = $this->actingAs($newOwner)->postJson('/api/fcm/tokens', [
        'token' => 'token_123',
        'device_name' => 'Pixel 9',
        'platform' => 'android',
        'app_version' => '1.2.0',
    ]);

    $response->assertSuccessful()
        ->assertJsonPath('data.id', $token->id);

    $token->refresh();

    expect($token->user_id)->toBe($newOwner->id)
        ->and($token->device_name)->toBe('Pixel 9')
        ->and($token->app_version)->toBe('1.2.0');
});

it('deletes an authenticated users own fcm token', function () {
    $user = User::factory()->create();
    $token = UserFcmToken::factory()->create([
        'user_id' => $user->id,
        'token' => 'token_123',
    ]);

    $response = $this->actingAs($user)->deleteJson('/api/fcm/tokens', [
        'token' => 'token_123',
    ]);

    $response->assertSuccessful()
        ->assertJson([
            'message' => 'FCM token removed successfully.',
        ]);

    expect(UserFcmToken::query()->find($token->id))->toBeNull();
});

it('does not delete another users fcm token', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $token = UserFcmToken::factory()->create([
        'user_id' => $otherUser->id,
        'token' => 'token_123',
    ]);

    $this->actingAs($user)->deleteJson('/api/fcm/tokens', [
        'token' => 'token_123',
    ])->assertSuccessful();

    expect(UserFcmToken::query()->find($token->id))->not->toBeNull();
});

it('returns unique fcm tokens for notification routing', function () {
    $user = User::factory()->create();

    UserFcmToken::factory()->create([
        'user_id' => $user->id,
        'token' => 'token_123',
    ]);

    UserFcmToken::factory()->create([
        'user_id' => $user->id,
        'token' => 'token_456',
    ]);

    expect($user->routeNotificationForFcm())->toBe([
        'token_123',
        'token_456',
    ]);
});
