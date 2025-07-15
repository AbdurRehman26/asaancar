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
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Resources\UserResource;

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
    return new UserResource($request->user());
});

// Auth API endpoints
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/forgot-password', [PasswordResetLinkController::class, 'store']);
Route::post('/reset-password', [NewPasswordController::class, 'store']);
Route::post('/confirm-password', [ConfirmablePasswordController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

// Public car routes (no authentication required)
Route::prefix('cars')->group(function () {
    Route::get('/', [CarController::class, 'index']);
    Route::get('/{id}', [CarController::class, 'show']);
    Route::get('/search', [CarController::class, 'search']);
    Route::get('/filters', [CarController::class, 'getFilters']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Booking routes
    Route::prefix('bookings')->group(function () {
        Route::get('/', [BookingController::class, 'index']);
        Route::post('/', [BookingController::class, 'store']);
        Route::get('/{id}', [BookingController::class, 'show']);
        Route::put('/{id}', [BookingController::class, 'update']);
        Route::delete('/{id}', [BookingController::class, 'destroy']);
        Route::get('/stats', [BookingController::class, 'stats']);
        Route::post('/check-availability', [BookingController::class, 'checkAvailability']);
        Route::post('/calculate-price', [BookingController::class, 'calculatePrice']);
    });
    Route::get('/bookings/user-car/{carId}', [\App\Http\Controllers\Customer\BookingController::class, 'userBookingForCar']);
});

// WebPush endpoints
Route::get('/webpush/public-key', [\App\Http\Controllers\WebPushController::class, 'publicKey']);
Route::middleware('auth:sanctum')->post('/webpush/subscribe', [\App\Http\Controllers\WebPushController::class, 'subscribe']);

// Chat endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/chat/conversations', [\App\Http\Controllers\ChatController::class, 'conversations']);
    Route::post('/chat/conversations', [\App\Http\Controllers\ChatController::class, 'store']);
    Route::get('/chat/conversations/{conversation}/messages', [\App\Http\Controllers\ChatController::class, 'messages']);
    Route::post('/chat/conversations/{conversation}/messages', [\App\Http\Controllers\ChatController::class, 'sendMessage']);
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