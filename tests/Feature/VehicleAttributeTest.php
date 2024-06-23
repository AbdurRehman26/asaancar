<?php

use App\Models\User;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use App\Models\VehicleType;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\getJson;

beforeEach(function (){
    actingAs(User::factory()->create());
});

it('list vehicle makes', function () {

    $response = getJson(route('v1.vehicle-make.index', [
        'filter' => [
                'vehicle_type_id' => VehicleType::TYPE_CAR
            ]
        ]))
        ->assertOk()
        ->assertJsonStructure(['data' => [
                '*' => [
                    'id',
                    'name',
                    'slug',
                    'code',
                    'vehicle_type_id'
                ]
            ]
        ]);

    expect(collect($response['data'])
        ->where('vehicle_type_id', '!=', VehicleType::TYPE_CAR)->count())->toBe(0);
});

it('list vehicle models', function () {

    getJson(route('v1.vehicle-model.index'))
        ->assertOk()
        ->assertJsonCount(VehicleModel::count(), 'data');
});

it('filters vehicle models based on make', function () {

    $vehicleMake = VehicleMake::first();

    getJson(route('v1.vehicle-model.index', [
        'filter' => [
            'vehicle_make_id' => $vehicleMake->id
        ]
    ]))
        ->assertOk()
        ->assertJsonCount(VehicleModel::where('vehicle_make_id', $vehicleMake->id)->count(), 'data');
});
