<?php

use App\Http\Controllers\Api\AreaController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\ImageUploadController;
use App\Http\Controllers\Api\PickAndDropController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Customer\CityController;
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
Route::post('/send-login-otp', [\App\Http\Controllers\Auth\OtpController::class, 'sendLoginOtp']);
Route::post('/verify-login-otp', [\App\Http\Controllers\Auth\OtpController::class, 'verifyLoginOtp']);
Route::post('/send-signup-otp', [\App\Http\Controllers\Auth\OtpController::class, 'sendSignupOtp']);
Route::post('/verify-signup-otp', [\App\Http\Controllers\Auth\OtpController::class, 'verifySignupOtp']);
Route::post('/set-password', [\App\Http\Controllers\Auth\OtpController::class, 'setPassword']);

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

// User information endpoint
Route::get('/user', [\App\Http\Controllers\Api\UserController::class, 'me'])->middleware('auth:sanctum');

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', function (Request $request) {
        $user = $request->user();

        // Check if user has admin or store_owner role
        if (! $user->hasAnyRole(['admin', 'store_owner'])) {
            return response()->json(['message' => 'Unauthorized. Only store owners and admins can access the dashboard.'], 403);
        }

        return response()->json(['message' => 'Welcome to the dashboard!']);
    });
    Route::patch('/settings/profile', [\App\Http\Controllers\Settings\ProfileController::class, 'update']);
    Route::delete('/settings/profile', [\App\Http\Controllers\Settings\ProfileController::class, 'destroy']);
    Route::put('/settings/password', [\App\Http\Controllers\Settings\PasswordController::class, 'update']);
});

// WebPush endpoints
Route::get('/webpush/public-key', [\App\Http\Controllers\WebPushController::class, 'publicKey']);
Route::middleware('auth:sanctum')->post('/webpush/subscribe', [\App\Http\Controllers\WebPushController::class, 'subscribe']);

// Chat endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/chat/conversations', [\App\Http\Controllers\ChatController::class, 'conversations']);
    Route::post('/chat/conversations', [\App\Http\Controllers\ChatController::class, 'store']);
    Route::delete('/chat/conversations/{conversation}', [\App\Http\Controllers\ChatController::class, 'destroy']);
    Route::get('/chat/conversations/{conversation}/messages', [\App\Http\Controllers\ChatController::class, 'messages']);
    Route::post('/chat/conversations/{conversation}/messages', [\App\Http\Controllers\ChatController::class, 'sendMessage']);
});

// Notification endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy']);
    Route::delete('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'deleteAll']);
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
        Route::post('/', [PickAndDropController::class, 'store']);
        Route::put('/{id}', [PickAndDropController::class, 'update']);
        Route::delete('/{id}', [PickAndDropController::class, 'destroy']);
    });
});

// Admin API Routes
Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    // Admin User Management Routes
    Route::get('/users/stats', [\App\Http\Controllers\Api\UserController::class, 'stats']);

    // Admin Contact Messages Routes
    Route::get('/contact-messages', [ContactMessageController::class, 'index']);
    Route::get('/contact-messages/stats', [ContactMessageController::class, 'stats']);

    // Postman Widget Routes (for testing APIs)
    Route::prefix('postman')->group(function () {
        Route::post('/execute', [\App\Http\Controllers\Filament\PostmanController::class, 'executeRequest']);
        Route::get('/template/pick-and-drop', [\App\Http\Controllers\Filament\PostmanController::class, 'getPickAndDropTemplate']);
    });
});
