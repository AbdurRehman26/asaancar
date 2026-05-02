<?php

use App\Models\PickAndDrop;
use App\Models\RideRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('syncs user gender from the latest pick and drop service first', function () {
    $user = User::factory()->create([
        'gender' => null,
    ]);

    RideRequest::factory()->for($user)->create([
        'preferred_driver_gender' => 'female',
    ]);

    PickAndDrop::factory()->for($user)->create([
        'driver_gender' => 'male',
    ]);

    $this->artisan('users:sync-gender')
        ->assertSuccessful()
        ->expectsTable([
            'Processed',
            'Updated',
            'Skipped',
        ], [[1, 1, 0]]);

    expect($user->fresh()->gender)->toBe('male');
});

it('falls back to the latest ride request when no pick and drop exists', function () {
    $user = User::factory()->create([
        'gender' => null,
    ]);

    RideRequest::factory()->for($user)->create([
        'preferred_driver_gender' => 'female',
    ]);

    $this->artisan('users:sync-gender')
        ->assertSuccessful();

    expect($user->fresh()->gender)->toBe('female');
});

it('skips ride request records that do not resolve to a concrete gender', function () {
    $user = User::factory()->create([
        'gender' => null,
    ]);

    RideRequest::factory()->for($user)->create([
        'preferred_driver_gender' => 'any',
    ]);

    $this->artisan('users:sync-gender')
        ->assertSuccessful()
        ->expectsTable([
            'Processed',
            'Updated',
            'Skipped',
        ], [[1, 0, 1]]);

    expect($user->fresh()->gender)->toBeNull();
});

it('does not overwrite an existing gender unless forced', function () {
    $user = User::factory()->create([
        'gender' => 'female',
    ]);

    PickAndDrop::factory()->for($user)->create([
        'driver_gender' => 'male',
    ]);

    $this->artisan('users:sync-gender')
        ->assertSuccessful()
        ->expectsTable([
            'Processed',
            'Updated',
            'Skipped',
        ], [[0, 0, 0]]);

    expect($user->fresh()->gender)->toBe('female');
});

it('overwrites an existing gender when forced', function () {
    $user = User::factory()->create([
        'gender' => 'female',
    ]);

    PickAndDrop::factory()->for($user)->create([
        'driver_gender' => 'male',
    ]);

    $this->artisan('users:sync-gender', [
        '--force' => true,
    ])
        ->assertSuccessful()
        ->expectsTable([
            'Processed',
            'Updated',
            'Skipped',
        ], [[1, 1, 0]]);

    expect($user->fresh()->gender)->toBe('male');
});
