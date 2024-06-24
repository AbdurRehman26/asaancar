<?php

use App\Models\RideOfferDetail;
use App\Models\User;
use App\Models\Vehicle;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\putJson;

beforeEach(function (){

    $this->user = User::factory()->create();

    actingAs($this->user);

});

it('lists ride offers', function (){

    RideOfferDetail::factory()->count(40)->create();

    getJson(route('v1.ride-offer.index'))
        ->assertOk();

});

it('stores ride offer', function (){

    $vehicle = Vehicle::factory()->create();

    postJson(route('v1.ride-offer.store'), [
        'vehicle_id' => $vehicle->id,
        'user_id' => $vehicle->user_id,
        'duration_for' => RideOfferDetail::DURATION_HOURLY,
        'with_driver' => true,
        'price' => 400
    ])
        ->assertCreated();

});

it('updates ride offer', function (){

    $rideOfferDetail = RideOfferDetail::factory()->create();
    $vehicle = Vehicle::factory()->create();

    putJson(route('v1.ride-offer.update', [
        'ride_offer' => $rideOfferDetail->rideOffer->id,
        'vehicle_id' => $vehicle,
        'duration_for' => $rideOfferDetail->duration_for,
        'with_driver' => $rideOfferDetail->with_driver,
        'price' => 10
    ]))->assertOk();

    expect($rideOfferDetail->refresh()->price)->toBe('10');
});
