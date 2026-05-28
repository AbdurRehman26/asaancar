<?php

use App\Models\Area;
use App\Models\City;
use App\Models\PickAndDrop;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

it('adds start and end area columns to pick and drop and ride request tables', function () {
    expect(Schema::hasColumns('pick_and_drop_services', [
        'start_area',
        'end_area',
    ]))->toBeTrue();

    expect(Schema::hasColumns('ride_requests', [
        'start_area',
        'end_area',
    ]))->toBeTrue();
});

it('adds google area id columns to pick and drop and ride request tables', function () {
    expect(Schema::hasColumns('pick_and_drop_services', [
        'start_area_google_id',
        'end_area_google_id',
    ]))->toBeTrue();

    expect(Schema::hasColumns('ride_requests', [
        'start_area_google_id',
        'end_area_google_id',
    ]))->toBeTrue();
});

it('copies existing area ids into google area id columns', function () {
    $city = City::factory()->create();
    $startArea = Area::factory()->create(['city_id' => $city->id]);
    $endArea = Area::factory()->create(['city_id' => $city->id]);

    $ride = PickAndDrop::factory()->create([
        'pickup_city_id' => $city->id,
        'pickup_area_id' => $startArea->id,
        'dropoff_city_id' => $city->id,
        'dropoff_area_id' => $endArea->id,
        'start_area_google_id' => null,
        'end_area_google_id' => null,
    ]);

    if (! Schema::hasColumn('ride_requests', 'start_area_id')) {
        Schema::table('ride_requests', function (Blueprint $table) {
            $table->string('start_area_id')->nullable()->after('start_area_google_id');
            $table->string('end_area_id')->nullable()->after('end_area_google_id');
        });
    }

    $user = User::factory()->create();

    $rideRequestId = DB::table('ride_requests')->insertGetId([
        'user_id' => $user->id,
        'name' => 'Test rider',
        'contact' => '03001234567',
        'start_location' => 'Start',
        'start_area_id' => 'google-start-area',
        'start_area_google_id' => null,
        'end_location' => 'End',
        'end_area_id' => 'google-end-area',
        'end_area_google_id' => null,
        'departure_time' => now()->addDay(),
        'required_seats' => 1,
        'preferred_driver_gender' => 'any',
        'currency' => 'PKR',
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $migration = require database_path('migrations/2026_05_25_102954_add_google_area_ids_to_pick_and_drop_services_and_ride_requests_tables.php');

    $migration->up();

    $ride->refresh();
    $rideRequest = DB::table('ride_requests')->where('id', $rideRequestId)->first();

    expect($ride->start_area_google_id)->toBe((string) $startArea->id)
        ->and($ride->end_area_google_id)->toBe((string) $endArea->id)
        ->and($rideRequest->start_area_google_id)->toBe('google-start-area')
        ->and($rideRequest->end_area_google_id)->toBe('google-end-area');
});
