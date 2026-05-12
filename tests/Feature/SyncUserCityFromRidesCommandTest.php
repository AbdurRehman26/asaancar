<?php

use App\Models\Area;
use App\Models\City;
use App\Models\PickAndDrop;
use App\Models\RideRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('syncs user city from the latest pick and drop service first', function () {
    $karachi = City::create(['name' => 'Karachi']);
    $lahore = City::create(['name' => 'Lahore']);
    $karachiArea = Area::create(['name' => 'Clifton', 'city_id' => $karachi->id]);
    $lahoreArea = Area::create(['name' => 'Gulberg', 'city_id' => $lahore->id]);
    $user = User::factory()->create(['city_id' => null]);

    PickAndDrop::factory()->for($user)->create([
        'pickup_city_id' => $lahore->id,
        'pickup_area_id' => $lahoreArea->id,
        'dropoff_city_id' => $lahore->id,
        'dropoff_area_id' => $lahoreArea->id,
    ]);

    RideRequest::factory()->for($user)->create([
        'start_location' => 'Karachi, Pakistan',
        'end_location' => 'Clifton, Karachi',
    ]);

    $this->artisan('users:sync-city')->assertSuccessful();

    expect($user->fresh()->city_id)->toBe($lahore->id);
});

it('falls back to the latest ride request when no pick and drop city exists', function () {
    $karachi = City::create(['name' => 'Karachi']);
    $user = User::factory()->create(['city_id' => null]);

    RideRequest::factory()->for($user)->create([
        'start_location' => 'DHA Phase 6, Karachi, Pakistan',
        'end_location' => 'Clifton Block 5, Karachi',
    ]);

    $this->artisan('users:sync-city')->assertSuccessful();

    expect($user->fresh()->city_id)->toBe($karachi->id);
});

it('does not overwrite an existing city unless forced', function () {
    $karachi = City::create(['name' => 'Karachi']);
    $lahore = City::create(['name' => 'Lahore']);
    $user = User::factory()->create(['city_id' => $karachi->id]);

    RideRequest::factory()->for($user)->create([
        'start_location' => 'Gulberg, Lahore, Pakistan',
        'end_location' => 'Johar Town, Lahore',
    ]);

    $this->artisan('users:sync-city')->assertSuccessful();

    expect($user->fresh()->city_id)->toBe($karachi->id);

    $this->artisan('users:sync-city', ['--force' => true])->assertSuccessful();

    expect($user->fresh()->city_id)->toBe($lahore->id);
});

it('can be limited to specific users', function () {
    $karachi = City::create(['name' => 'Karachi']);
    $lahore = City::create(['name' => 'Lahore']);
    $firstUser = User::factory()->create(['city_id' => null]);
    $secondUser = User::factory()->create(['city_id' => null]);

    RideRequest::factory()->for($firstUser)->create([
        'start_location' => 'Karachi, Pakistan',
        'end_location' => 'Clifton, Karachi',
    ]);

    RideRequest::factory()->for($secondUser)->create([
        'start_location' => 'Lahore, Pakistan',
        'end_location' => 'Gulberg, Lahore',
    ]);

    $this->artisan('users:sync-city', [
        '--users' => [$firstUser->id],
    ])->assertSuccessful();

    expect($firstUser->fresh()->city_id)->toBe($karachi->id);
    expect($secondUser->fresh()->city_id)->toBeNull();
    expect($lahore->id)->toBeInt();
});
