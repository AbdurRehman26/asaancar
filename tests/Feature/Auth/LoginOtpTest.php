<?php

use App\Jobs\SendOtpJob;
use App\Models\User;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Role;

it('creates a customer user and sends login otp when the phone number does not exist', function () {
    Queue::fake();
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

    $phoneNumber = '+923001234567';

    $response = $this->postJson('/api/send-login-otp', [
        'phone_number' => $phoneNumber,
    ]);

    $response->assertSuccessful()
        ->assertJson([
            'success' => true,
            'message' => 'OTP sent successfully',
            'identifier' => $phoneNumber,
        ]);

    $user = User::query()->where('phone_number', $phoneNumber)->first();

    expect($user)->not()->toBeNull();
    expect($user->name)->toBe('User 4567');
    expect($user->is_verified)->toBeFalse();
    expect($user->otp_code)->not()->toBeNull();
    expect($user->otp_expires_at)->not()->toBeNull();
    expect($user->hasRole('customer'))->toBeTrue();

    Queue::assertPushed(SendOtpJob::class, function (SendOtpJob $job) use ($user, $phoneNumber) {
        return $job->phoneNumber === $phoneNumber
            && $job->userId === $user->id
            && $job->isSignup === false;
    });
});
