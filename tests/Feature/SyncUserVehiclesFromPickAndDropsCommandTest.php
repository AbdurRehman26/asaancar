<?php

use App\Models\Area;
use App\Models\City;
use App\Models\PickAndDrop;
use App\Models\User;
use App\Models\UserVehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $city = City::create(['name' => 'Karachi']);
    $area = Area::create(['name' => 'Clifton', 'city_id' => $city->id]);

    $this->city = $city;
    $this->area = $area;
});

it('creates a saved vehicle from pick and drop vehicle details', function () {
    $user = User::factory()->create();

    PickAndDrop::factory()->for($user)->create([
        'pickup_city_id' => $this->city->id,
        'pickup_area_id' => $this->area->id,
        'dropoff_city_id' => $this->city->id,
        'dropoff_area_id' => $this->area->id,
        'vehicle_type' => 'bike',
        'car_brand' => 'Honda',
        'car_model' => 'CB 125',
        'car_color' => 'Black',
        'car_seats' => 2,
        'car_transmission' => 'manual',
        'car_fuel_type' => 'petrol',
    ]);

    $this->artisan('users:sync-vehicles-from-pick-and-drops')
        ->assertSuccessful();

    $this->assertDatabaseHas('user_vehicles', [
        'user_id' => $user->id,
        'vehicle_type' => 'bike',
        'brand' => 'Honda',
        'model' => 'CB 125',
        'color' => 'Black',
        'seats' => 2,
        'transmission' => 'manual',
        'fuel_type' => 'petrol',
        'is_default' => true,
    ]);
});

it('does not create duplicate saved vehicles for identical pick and drop entries', function () {
    $user = User::factory()->create();

    PickAndDrop::factory()->count(2)->for($user)->create([
        'pickup_city_id' => $this->city->id,
        'pickup_area_id' => $this->area->id,
        'dropoff_city_id' => $this->city->id,
        'dropoff_area_id' => $this->area->id,
        'vehicle_type' => 'car',
        'car_brand' => 'Toyota',
        'car_model' => 'Corolla',
        'car_color' => 'White',
        'car_seats' => 4,
        'car_transmission' => 'automatic',
        'car_fuel_type' => 'petrol',
    ]);

    $this->artisan('users:sync-vehicles-from-pick-and-drops')
        ->assertSuccessful();

    expect(UserVehicle::query()->where('user_id', $user->id)->count())->toBe(1);
});

it('creates multiple saved vehicles when the vehicle details differ', function () {
    $user = User::factory()->create();

    PickAndDrop::factory()->for($user)->create([
        'pickup_city_id' => $this->city->id,
        'pickup_area_id' => $this->area->id,
        'dropoff_city_id' => $this->city->id,
        'dropoff_area_id' => $this->area->id,
        'vehicle_type' => 'car',
        'car_brand' => 'Toyota',
        'car_model' => 'Corolla',
        'car_color' => 'White',
        'car_seats' => 4,
        'car_transmission' => 'automatic',
        'car_fuel_type' => 'petrol',
    ]);

    PickAndDrop::factory()->for($user)->create([
        'pickup_city_id' => $this->city->id,
        'pickup_area_id' => $this->area->id,
        'dropoff_city_id' => $this->city->id,
        'dropoff_area_id' => $this->area->id,
        'vehicle_type' => 'bike',
        'car_brand' => 'Honda',
        'car_model' => 'CB 125',
        'car_color' => 'Black',
        'car_seats' => 2,
        'car_transmission' => 'manual',
        'car_fuel_type' => 'petrol',
    ]);

    $this->artisan('users:sync-vehicles-from-pick-and-drops')
        ->assertSuccessful();

    expect(UserVehicle::query()->where('user_id', $user->id)->count())->toBe(2);
    expect(UserVehicle::query()->where('user_id', $user->id)->where('is_default', true)->count())->toBe(1);
});

it('can be limited to specific users', function () {
    $includedUser = User::factory()->create();
    $excludedUser = User::factory()->create();

    PickAndDrop::factory()->for($includedUser)->create([
        'pickup_city_id' => $this->city->id,
        'pickup_area_id' => $this->area->id,
        'dropoff_city_id' => $this->city->id,
        'dropoff_area_id' => $this->area->id,
        'vehicle_type' => 'car',
        'car_brand' => 'Toyota',
    ]);

    PickAndDrop::factory()->for($excludedUser)->create([
        'pickup_city_id' => $this->city->id,
        'pickup_area_id' => $this->area->id,
        'dropoff_city_id' => $this->city->id,
        'dropoff_area_id' => $this->area->id,
        'vehicle_type' => 'bike',
        'car_brand' => 'Honda',
    ]);

    $this->artisan('users:sync-vehicles-from-pick-and-drops', [
        '--users' => [$includedUser->id],
    ])->assertSuccessful();

    expect(UserVehicle::query()->where('user_id', $includedUser->id)->count())->toBe(1);
    expect(UserVehicle::query()->where('user_id', $excludedUser->id)->count())->toBe(0);
});
