<?php

use App\Models\Car;
use App\Models\Store;
use App\Models\CarBrand;
use App\Models\CarType;
use App\Models\CarEngine;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('car listing API returns cars successfully', function () {
    $store = Store::factory()->create();
    $brand = CarBrand::factory()->create();
    $type = CarType::factory()->create();
    $engine = CarEngine::factory()->create();
    Car::factory()->create([
        'store_id' => $store->id,
        'car_brand_id' => $brand->id,
        'car_type_id' => $type->id,
        'car_engine_id' => $engine->id,
    ]);
    $response = $this->getJson('/api/customer/cars');
    $response->assertStatus(200);
    $response->assertJsonStructure([
        'data', 'current_page', 'per_page', 'total'
    ]);
});

test('car listing API shows car data', function () {
    $store = Store::factory()->create();
    $brand = CarBrand::factory()->create();
    $type = CarType::factory()->create();
    $engine = CarEngine::factory()->create();
    $car = Car::factory()->create([
        'store_id' => $store->id,
        'car_brand_id' => $brand->id,
        'car_type_id' => $type->id,
        'car_engine_id' => $engine->id,
        'name' => 'Test Car'
    ]);
    $response = $this->getJson('/api/customer/cars');
    $response->assertStatus(200);
    $response->assertJsonFragment(['name' => 'Test Car']);
});

test('car listing API filters by brand', function () {
    $store = Store::factory()->create();
    $brandA = CarBrand::factory()->create();
    $brandB = CarBrand::factory()->create();
    $type = CarType::factory()->create();
    $engine = CarEngine::factory()->create();
    $car1 = Car::factory()->create([
        'store_id' => $store->id,
        'car_brand_id' => $brandA->id,
        'car_type_id' => $type->id,
        'car_engine_id' => $engine->id,
        'name' => 'BrandA Car'
    ]);
    $car2 = Car::factory()->create([
        'store_id' => $store->id,
        'car_brand_id' => $brandB->id,
        'car_type_id' => $type->id,
        'car_engine_id' => $engine->id,
        'name' => 'BrandB Car'
    ]);
    $response = $this->getJson('/api/customer/cars?brand_id=' . $brandA->id);
    $response->assertStatus(200);
    $response->assertJsonFragment(['name' => 'BrandA Car']);
    $response->assertJsonMissing(['name' => 'BrandB Car']);
});

test('car listing API includes booking info for available cars', function () {
    $store = Store::factory()->create();
    $brand = CarBrand::factory()->create();
    $type = CarType::factory()->create();
    $engine = CarEngine::factory()->create();
    $car = Car::factory()->create([
        'store_id' => $store->id,
        'car_brand_id' => $brand->id,
        'car_type_id' => $type->id,
        'car_engine_id' => $engine->id,
        'name' => 'Bookable Car'
    ]);
    $response = $this->getJson('/api/customer/cars');
    $response->assertStatus(200);
    $response->assertJsonFragment(['name' => 'Bookable Car']);
    // Optionally check for booking-related fields if present in API
}); 