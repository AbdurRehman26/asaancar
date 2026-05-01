<?php

use App\Events\LiveRideAssigned;
use App\Events\LiveRideCancelled;
use App\Events\LiveRideCompleted;
use App\Events\LiveRideDriverArrived;
use App\Events\LiveRideRequested;
use App\Events\LiveRideStarted;
use App\Models\DriverAvailability;
use App\Models\DriverLocation;
use App\Models\LiveRideRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('broadcasting.default', 'null');
});

it('returns a live ride estimate', function () {
    $response = $this->postJson('/api/live-rides/estimate', [
        'pickup_location' => 'DHA Phase 6, Karachi',
        'pickup_latitude' => 24.8006,
        'pickup_longitude' => 67.0631,
        'dropoff_location' => 'Clifton Block 5, Karachi',
        'dropoff_latitude' => 24.8138,
        'dropoff_longitude' => 67.0295,
        'vehicle_type' => 'go',
    ]);

    $response->assertSuccessful()
        ->assertJsonStructure([
            'data' => ['estimated_fare', 'distance_km', 'eta_minutes', 'currency'],
            'message',
        ]);
});

it('creates a live ride and prevents a second active ride for the same rider', function () {
    Event::fake([LiveRideRequested::class]);

    $rider = User::factory()->create();
    $driver = User::factory()->create();

    DriverAvailability::factory()->create([
        'driver_user_id' => $driver->id,
        'is_online' => true,
        'is_available' => true,
        'vehicle_type' => 'go',
    ]);

    DriverLocation::factory()->create([
        'driver_user_id' => $driver->id,
        'latitude' => '24.8010000',
        'longitude' => '67.0635000',
    ]);

    $payload = [
        'pickup_location' => 'DHA Phase 6, Karachi',
        'pickup_latitude' => 24.8006,
        'pickup_longitude' => 67.0631,
        'dropoff_location' => 'Clifton Block 5, Karachi',
        'dropoff_latitude' => 24.8138,
        'dropoff_longitude' => 67.0295,
        'estimated_fare' => 550,
        'vehicle_type' => 'go',
    ];

    $createResponse = $this->actingAs($rider)->postJson('/api/customer/live-rides', $payload);

    $createResponse->assertCreated()
        ->assertJsonPath('data.status', LiveRideRequest::STATUS_SEARCHING)
        ->assertJsonPath('data.rider.id', $rider->id);

    Event::assertDispatched(LiveRideRequested::class);

    $activeResponse = $this->actingAs($rider)->getJson('/api/customer/live-rides/active');

    $activeResponse->assertSuccessful()
        ->assertJsonPath('data.status', LiveRideRequest::STATUS_SEARCHING);

    $secondResponse = $this->actingAs($rider)->postJson('/api/customer/live-rides', $payload);

    $secondResponse->assertUnprocessable()
        ->assertJsonValidationErrors(['rider_user_id']);
});

it('shows incoming rides for a nearby driver and only allows one driver to accept', function () {
    Event::fake([LiveRideAssigned::class]);

    $rider = User::factory()->create();
    $driverOne = User::factory()->create();
    $driverTwo = User::factory()->create();

    foreach ([$driverOne, $driverTwo] as $driver) {
        DriverAvailability::factory()->create([
            'driver_user_id' => $driver->id,
            'is_online' => true,
            'is_available' => true,
            'vehicle_type' => 'go',
        ]);

        DriverLocation::factory()->create([
            'driver_user_id' => $driver->id,
            'latitude' => '24.8010000',
            'longitude' => '67.0635000',
        ]);
    }

    $ride = LiveRideRequest::factory()->create([
        'rider_user_id' => $rider->id,
        'status' => LiveRideRequest::STATUS_SEARCHING,
        'vehicle_type' => 'go',
        'pickup_latitude' => '24.8006000',
        'pickup_longitude' => '67.0631000',
    ]);

    $incomingResponse = $this->actingAs($driverOne)->getJson('/api/driver/live-rides/incoming');

    $incomingResponse->assertSuccessful()
        ->assertJsonPath('data.0.id', $ride->id);

    $acceptResponse = $this->actingAs($driverOne)->postJson("/api/driver/live-rides/{$ride->id}/accept");

    $acceptResponse->assertSuccessful()
        ->assertJsonPath('data.status', LiveRideRequest::STATUS_DRIVER_ASSIGNED)
        ->assertJsonPath('data.driver.id', $driverOne->id);

    Event::assertDispatched(LiveRideAssigned::class);

    $secondAcceptResponse = $this->actingAs($driverTwo)->postJson("/api/driver/live-rides/{$ride->id}/accept");

    $secondAcceptResponse->assertUnprocessable()
        ->assertJsonValidationErrors(['ride']);
});

it('tracks driver lifecycle updates and returns latest driver location and timeline', function () {
    Event::fake([
        LiveRideDriverArrived::class,
        LiveRideStarted::class,
        LiveRideCompleted::class,
    ]);

    $rider = User::factory()->create();
    $driver = User::factory()->create();

    DriverAvailability::factory()->create([
        'driver_user_id' => $driver->id,
        'is_online' => true,
        'is_available' => false,
    ]);

    DriverLocation::factory()->create([
        'driver_user_id' => $driver->id,
        'latitude' => '24.8010000',
        'longitude' => '67.0635000',
    ]);

    $ride = LiveRideRequest::factory()->create([
        'rider_user_id' => $rider->id,
        'driver_user_id' => $driver->id,
        'status' => LiveRideRequest::STATUS_DRIVER_ASSIGNED,
        'accepted_at' => now(),
    ]);

    $this->actingAs($driver)->postJson('/api/driver/location', [
        'latitude' => 24.8021,
        'longitude' => 67.0641,
        'heading' => 130,
    ])->assertSuccessful();

    $this->actingAs($driver)->postJson("/api/driver/live-rides/{$ride->id}/arrived")
        ->assertSuccessful()
        ->assertJsonPath('data.status', LiveRideRequest::STATUS_DRIVER_ARRIVING);

    $this->actingAs($driver)->postJson("/api/driver/live-rides/{$ride->id}/start")
        ->assertSuccessful()
        ->assertJsonPath('data.status', LiveRideRequest::STATUS_IN_PROGRESS);

    $this->actingAs($driver)->postJson("/api/driver/live-rides/{$ride->id}/complete", [
        'final_fare' => 620,
    ])->assertSuccessful()
        ->assertJsonPath('data.status', LiveRideRequest::STATUS_COMPLETED)
        ->assertJsonPath('data.final_fare', 620);

    $trackingResponse = $this->actingAs($rider)->getJson("/api/live-rides/{$ride->id}/tracking");

    $trackingResponse->assertSuccessful()
        ->assertJsonPath('data.status', LiveRideRequest::STATUS_COMPLETED)
        ->assertJsonPath('data.latest_driver_location.driver_user_id', $driver->id);

    $timelineResponse = $this->actingAs($rider)->getJson("/api/live-rides/{$ride->id}/timeline");

    $timelineResponse->assertSuccessful()
        ->assertJsonFragment(['event_type' => 'driver_arrived'])
        ->assertJsonFragment(['event_type' => 'trip_started'])
        ->assertJsonFragment(['event_type' => 'trip_completed']);

    Event::assertDispatched(LiveRideDriverArrived::class);
    Event::assertDispatched(LiveRideStarted::class);
    Event::assertDispatched(LiveRideCompleted::class);
});

it('allows rider cancellation and makes the driver available again', function () {
    Event::fake([LiveRideCancelled::class]);

    $rider = User::factory()->create();
    $driver = User::factory()->create();

    DriverAvailability::factory()->create([
        'driver_user_id' => $driver->id,
        'is_online' => true,
        'is_available' => false,
    ]);

    $ride = LiveRideRequest::factory()->create([
        'rider_user_id' => $rider->id,
        'driver_user_id' => $driver->id,
        'status' => LiveRideRequest::STATUS_DRIVER_ASSIGNED,
    ]);

    $response = $this->actingAs($rider)->postJson("/api/customer/live-rides/{$ride->id}/cancel", [
        'reason' => 'Changed my mind',
    ]);

    $response->assertSuccessful()
        ->assertJsonPath('data.status', LiveRideRequest::STATUS_CANCELLED)
        ->assertJsonPath('data.cancelled_by', 'rider');

    expect(DriverAvailability::query()->where('driver_user_id', $driver->id)->value('is_available'))->toBeTrue();

    Event::assertDispatched(LiveRideCancelled::class);
});
