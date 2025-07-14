<?php

use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('car listing page loads successfully', function () {
    $response = $this->get('/cars');
    $response->assertStatus(200);
    $response->assertSee('Available Cars');
});

test('car listing page shows car data', function () {
    $car = Car::factory()->create(['name' => 'Test Car', 'available' => true]);
    $response = $this->get('/cars');
    $response->assertSee('Test Car');
});

test('car listing page filters by brand', function () {
    $car1 = Car::factory()->create(['name' => 'BrandA Car', 'car_brand_id' => 1]);
    $car2 = Car::factory()->create(['name' => 'BrandB Car', 'car_brand_id' => 2]);
    $response = $this->get('/cars?brand_id=1');
    $response->assertSee('BrandA Car');
    $response->assertDontSee('BrandB Car');
});

test('booking button is present for available cars', function () {
    $car = Car::factory()->create(['available' => true, 'name' => 'Bookable Car']);
    $response = $this->get('/cars');
    $response->assertSee('Book Now');
}); 