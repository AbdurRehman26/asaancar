<?php

test('new users can register', function () {
    $this->postJson(route('v1.auth.register'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertOk();
});
