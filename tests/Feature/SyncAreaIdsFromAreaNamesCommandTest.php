<?php

use App\Models\Area;
use App\Models\City;
use App\Models\PickAndDrop;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

it('saves pick and drop area ids from area names', function () {
    $city = City::factory()->create();
    $startArea = Area::factory()->create([
        'city_id' => $city->id,
        'name' => 'DHA Phase 8',
    ]);
    $endArea = Area::factory()->create([
        'city_id' => $city->id,
        'name' => 'Clifton',
    ]);

    $ride = PickAndDrop::factory()->create([
        'pickup_city_id' => $city->id,
        'pickup_area_id' => null,
        'start_area' => 'DHA Phase 8',
        'start_area_google_id' => 'ignored-start-google-id',
        'dropoff_city_id' => $city->id,
        'dropoff_area_id' => null,
        'end_area' => 'Clifton',
        'end_area_google_id' => 'ignored-end-google-id',
    ]);

    $this->artisan('areas:sync-ids-from-names', ['--source' => 'pick-and-drop'])
        ->assertSuccessful();

    $ride->refresh();

    expect($ride->pickup_area_id)->toBe($startArea->id)
        ->and($ride->dropoff_area_id)->toBe($endArea->id);
});

it('does not use google area id values as area ids', function () {
    $city = City::factory()->create();
    Area::factory()->create(['city_id' => $city->id]);

    $ride = PickAndDrop::factory()->create([
        'pickup_city_id' => $city->id,
        'pickup_area_id' => null,
        'start_area' => 'Area name that does not exist',
        'start_area_google_id' => '1',
        'dropoff_city_id' => $city->id,
        'dropoff_area_id' => null,
        'end_area' => 'Another area that does not exist',
        'end_area_google_id' => '1',
    ]);

    $this->artisan('areas:sync-ids-from-names', ['--source' => 'pick-and-drop'])
        ->assertSuccessful();

    $ride->refresh();

    expect($ride->pickup_area_id)->toBeNull()
        ->and($ride->dropoff_area_id)->toBeNull();
});

it('saves ride request area ids from area names when target columns exist', function () {
    Schema::table('ride_requests', function (Blueprint $table) {
        if (! Schema::hasColumn('ride_requests', 'start_area_id')) {
            $table->foreignId('start_area_id')->nullable()->after('start_area_google_id')->constrained('areas')->nullOnDelete();
        }

        if (! Schema::hasColumn('ride_requests', 'end_area_id')) {
            $table->foreignId('end_area_id')->nullable()->after('end_area_google_id')->constrained('areas')->nullOnDelete();
        }
    });

    $startArea = Area::factory()->create(['name' => 'Gulshan-e-Iqbal']);
    $endArea = Area::factory()->create(['name' => 'North Nazimabad']);
    $user = User::factory()->create();

    $rideRequestId = DB::table('ride_requests')->insertGetId([
        'user_id' => $user->id,
        'start_location' => 'Start',
        'start_area' => 'Gulshan-e-Iqbal',
        'start_area_google_id' => 'ignored-start-google-id',
        'start_area_id' => null,
        'end_location' => 'End',
        'end_area' => 'North Nazimabad',
        'end_area_google_id' => 'ignored-end-google-id',
        'end_area_id' => null,
        'departure_time' => now()->addDay(),
        'required_seats' => 1,
        'preferred_driver_gender' => 'any',
        'currency' => 'PKR',
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->artisan('areas:sync-ids-from-names', ['--source' => 'ride-request'])
        ->assertSuccessful();

    $rideRequest = DB::table('ride_requests')->where('id', $rideRequestId)->first();

    expect($rideRequest->start_area_id)->toBe($startArea->id)
        ->and($rideRequest->end_area_id)->toBe($endArea->id);
});
