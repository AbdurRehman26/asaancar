<?php

use App\Models\User;

uses(Tests\TestCase::class);

it('returns no otp when there is no otp code', function () {
    $user = new User([
        'otp_code' => null,
        'otp_expires_at' => null,
    ]);

    expect($user->otp_status)->toBe('No OTP');
});

it('returns active when otp has not expired', function () {
    $user = new User([
        'otp_code' => '123456',
        'otp_expires_at' => now()->addMinutes(5),
    ]);

    expect($user->otp_status)->toBe('Active');
});

it('returns expired when otp expiry is in the past', function () {
    $user = new User([
        'otp_code' => '123456',
        'otp_expires_at' => now()->subMinute(),
    ]);

    expect($user->otp_status)->toBe('Expired');
});
