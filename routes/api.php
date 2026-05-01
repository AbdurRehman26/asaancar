<?php

use App\Http\Controllers\Api\AreaController;
use App\Http\Controllers\Api\ContactingStatController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\CustomerLiveRideController;
use App\Http\Controllers\Api\DriverAvailabilityController;
use App\Http\Controllers\Api\DriverLiveRideController;
use App\Http\Controllers\Api\DriverLocationController;
use App\Http\Controllers\Api\ImageUploadController;
use App\Http\Controllers\Api\LiveRideEstimateController;
use App\Http\Controllers\Api\LiveRideTrackingController;
use App\Http\Controllers\Api\PickAndDropController;
use App\Http\Controllers\Api\PickAndDropFavoriteController;
use App\Http\Controllers\Api\RideRequestController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\OtpController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\Customer\CityController;
use App\Http\Controllers\Filament\PostmanController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\WebPushController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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

// Auth API endpoints
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/forgot-password', [PasswordResetLinkController::class, 'store']);
Route::post('/reset-password', [NewPasswordController::class, 'store']);
Route::post('/confirm-password', [ConfirmablePasswordController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);
Route::post('/contact', [ContactMessageController::class, 'store']);

// OTP endpoints
Route::post('/send-login-otp', [OtpController::class, 'sendLoginOtp']);
Route::post('/verify-login-otp', [OtpController::class, 'verifyLoginOtp']);
Route::post('/send-signup-otp', [OtpController::class, 'sendSignupOtp']);
Route::post('/verify-signup-otp', [OtpController::class, 'verifySignupOtp']);
Route::post('/set-password', [OtpController::class, 'setPassword']);

// Image Upload API Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/upload/image', [ImageUploadController::class, 'uploadSingle']);
    Route::post('/upload/images', [ImageUploadController::class, 'uploadMultiple']);
    Route::delete('/upload/image', [ImageUploadController::class, 'delete']);
});

// Public image serving route (no authentication required)
Route::get('/images/serve', [ImageUploadController::class, 'serveImage']);

// Email verification for API
Route::get('/email/verify/{id}/{hash}', [VerifyEmailController::class, '__invoke'])
    ->middleware(['signed'])
    ->name('verification.verify');

// Public pick and drop services routes
Route::prefix('pick-and-drop')->group(function () {
    Route::get('/', [PickAndDropController::class, 'index']);
    Route::get('/{id}', [PickAndDropController::class, 'show']);
});

Route::prefix('ride-requests')->group(function () {
    Route::get('/', [RideRequestController::class, 'index']);
    Route::get('/{id}', [RideRequestController::class, 'show']);
});

Route::post('/live-rides/estimate', [LiveRideEstimateController::class, 'store']);

// User information endpoint
Route::get('/user', [UserController::class, 'me'])->middleware('auth:sanctum');

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', function (Request $request) {
        $user = $request->user();

        // Check if user has admin role
        if (! $user->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized. Only admins can access the dashboard.'], 403);
        }

        return response()->json(['message' => 'Welcome to the dashboard!']);
    });
    Route::patch('/settings/profile', [ProfileController::class, 'update']);
    Route::delete('/settings/profile', [ProfileController::class, 'destroy']);
    Route::put('/settings/password', [PasswordController::class, 'update']);
});

// WebPush endpoints
Route::get('/webpush/public-key', [WebPushController::class, 'publicKey']);
Route::middleware('auth:sanctum')->post('/webpush/subscribe', [WebPushController::class, 'subscribe']);

// Chat endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/chat/conversations', [ChatController::class, 'conversations']);
    Route::get('/chat/unread-summary', [ChatController::class, 'unreadSummary']);
    Route::post('/chat/conversations', [ChatController::class, 'store']);
    Route::delete('/chat/conversations/{conversation}', [ChatController::class, 'destroy']);
    Route::get('/chat/conversations/{conversation}/messages', [ChatController::class, 'messages']);
    Route::post('/chat/conversations/{conversation}/messages', [ChatController::class, 'sendMessage']);
    Route::post('/contacting-stats', [ContactingStatController::class, 'store']);
    Route::get('/live-rides/{liveRideRequest}/tracking', [LiveRideTrackingController::class, 'tracking']);
    Route::get('/live-rides/{liveRideRequest}/timeline', [LiveRideTrackingController::class, 'timeline']);
    Route::post('/driver/availability', [DriverAvailabilityController::class, 'store']);
    Route::post('/driver/location', [DriverLocationController::class, 'store']);
    Route::get('/driver/live-rides/incoming', [DriverLiveRideController::class, 'incoming']);
    Route::post('/driver/live-rides/{liveRideRequest}/accept', [DriverLiveRideController::class, 'accept']);
    Route::post('/driver/live-rides/{liveRideRequest}/reject', [DriverLiveRideController::class, 'reject']);
    Route::post('/driver/live-rides/{liveRideRequest}/arrived', [DriverLiveRideController::class, 'arrived']);
    Route::post('/driver/live-rides/{liveRideRequest}/start', [DriverLiveRideController::class, 'start']);
    Route::post('/driver/live-rides/{liveRideRequest}/complete', [DriverLiveRideController::class, 'complete']);
    Route::post('/driver/live-rides/{liveRideRequest}/cancel', [DriverLiveRideController::class, 'cancel']);
});

// Cities API
Route::get('/cities', [CityController::class, 'index']);

// Areas API
Route::get('/areas', [AreaController::class, 'index']);

// Customer API Routes
Route::prefix('customer')->middleware(['auth:sanctum'])->group(function () {
    // Pick and Drop Management Routes
    Route::prefix('pick-and-drop')->group(function () {
        Route::get('/my-services', [PickAndDropController::class, 'myServices']);
        Route::get('/favorites', [PickAndDropFavoriteController::class, 'index']);
        Route::post('/favorites', [PickAndDropFavoriteController::class, 'store']);
        Route::delete('/favorites/{id}', [PickAndDropFavoriteController::class, 'destroy']);
        Route::post('/', [PickAndDropController::class, 'store']);
        Route::put('/{id}', [PickAndDropController::class, 'update']);
        Route::delete('/{id}', [PickAndDropController::class, 'destroy']);
    });

    Route::prefix('ride-requests')->group(function () {
        Route::get('/my-requests', [RideRequestController::class, 'myRequests']);
        Route::post('/', [RideRequestController::class, 'store']);
        Route::put('/{id}', [RideRequestController::class, 'update']);
        Route::delete('/{id}', [RideRequestController::class, 'destroy']);
    });

    Route::prefix('live-rides')->group(function () {
        Route::post('/', [CustomerLiveRideController::class, 'store']);
        Route::get('/active', [CustomerLiveRideController::class, 'active']);
        Route::get('/{liveRideRequest}', [CustomerLiveRideController::class, 'show']);
        Route::post('/{liveRideRequest}/cancel', [CustomerLiveRideController::class, 'cancel']);
    });
});

// Admin API Routes
Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    // Admin User Management Routes
    Route::get('/users/stats', [UserController::class, 'stats']);

    // Admin Contact Messages Routes
    Route::get('/contact-messages', [ContactMessageController::class, 'index']);
    Route::get('/contact-messages/stats', [ContactMessageController::class, 'stats']);

    // Postman Widget Routes (for testing APIs)
    Route::prefix('postman')->group(function () {
        Route::post('/execute', [PostmanController::class, 'executeRequest']);
        Route::get('/template/pick-and-drop', [PostmanController::class, 'getPickAndDropTemplate']);
    });
});
