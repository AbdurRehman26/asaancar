<?php

use App\Models\User;

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->postJson(route('v1.login'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertUnprocessable();
});
