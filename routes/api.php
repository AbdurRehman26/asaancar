<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Customer\CarController;
use App\Http\Controllers\Customer\StoreController;
use App\Http\Controllers\Customer\CarBrandController;
use App\Http\Controllers\Customer\CarTypeController;
use App\Http\Controllers\Customer\CarEngineController;
use App\Http\Controllers\Customer\BookingController;
use App\Http\Controllers\Customer\CarOfferController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Customer API Routes
Route::prefix('customer')->group(function () {
    // Car Management Routes
    Route::apiResource('cars', CarController::class);

    // Store Management Routes
    Route::apiResource('stores', StoreController::class);

    // Car Brand Management Routes
    Route::apiResource('car-brands', CarBrandController::class);

    // Car Type Management Routes
    Route::apiResource('car-types', CarTypeController::class);

    // Car Engine Management Routes
    Route::apiResource('car-engines', CarEngineController::class);

    // Booking Management Routes
    Route::apiResource('bookings', BookingController::class);

    // Car Offer Management Routes
    Route::apiResource('car-offers', CarOfferController::class);
}); 