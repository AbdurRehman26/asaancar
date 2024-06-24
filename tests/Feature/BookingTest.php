<?php

use App\Models\BookingStatus;
use App\Models\RideOffer;
use App\Models\User;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\postJson;

beforeEach(function (){

    $this->user = User::factory()->create();
    actingAs($this->user);

    $this->rideOffer = RideOffer::factory()->create();

});

it('stores booking request', function (){

    $status = BookingStatus::factory()->create();

    postJson(route('v1.booking.store'), [
        'ride_offer_id' => $this->rideOffer->id,
        'booking_status_id' => $status->id,
        'from_location' => fake()->streetName(),
        'from_date_time' => now()->format('Y-m-d H:i'),
        'to_date_time' => now()->addHours(5)->format('Y-m-d H:i')
    ])
        ->assertCreated();

});
