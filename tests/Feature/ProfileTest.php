<?php

use App\Models\User;

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->patchJson(route('v1.profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
            'timezone' => 'UTC',
        ]);

    $user->refresh();

    expect('Test User')->toEqual($user->name);
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->patchJson(route('v1.profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    expect($user->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->deleteJson(route('v1.profile.destroy'), [
            'password' => 'password',
        ]);

    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('v1.profile'))
        ->delete(route('v1.profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrorsIn('userDeletion', 'password')
        ->assertRedirect(route('v1.profile'));

    expect($user->fresh())->not->toBeNull();
});
