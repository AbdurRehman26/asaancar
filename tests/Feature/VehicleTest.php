<?php

use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleModel;
use App\Models\VehicleType;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\putJson;

beforeEach(function (){

    $this->user = User::factory()->create();

    actingAs($this->user);

    Vehicle::factory()->count(5)->create([
        'user_id' => $this->user->id
    ]);
});

it('stores vehicle', function () {

    postJson(route('v1.vehicle.store', [
        'vehicle_type_id' => VehicleType::factory()->create(),
        'vehicle_model_id' => VehicleModel::factory()->create(),
        'color' => '#AAAAAA',
        'year_of_manufacture' => now()->toDate()->format('Y-m-d'),
        'number_plate' => '123123'
    ]))->assertCreated();
});


it('updates vehicle information', function () {

    $vehicle = Vehicle::factory()->create();

    putJson(route('v1.vehicle.update', array_merge($vehicle->toArray(), [
        'vehicle' => $vehicle->id,
        'color' => 'green'
    ])))->assertOk()
        ->assertJsonFragment([
                'color' => 'green'
            ]);

});

it('returns user vehicles', function () {

    getJson(route('v1.vehicle.index', [
        'filter' => [
            'user_id' => $this->user->id
        ]
    ]))
        ->assertJsonCount(Vehicle::where('user_id', $this->user->id)->count(), 'data')
        ->assertOk();
});
