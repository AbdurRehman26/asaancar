<?php

use App\Http\Controllers\V1\Auth\AuthenticatedSessionController;
use App\Http\Controllers\V1\Auth\ConfirmablePasswordController;
use App\Http\Controllers\V1\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\V1\Auth\EmailVerificationPromptController;
use App\Http\Controllers\V1\Auth\LoginController;
use App\Http\Controllers\V1\Auth\NewPasswordController;
use App\Http\Controllers\V1\Auth\PasswordController;
use App\Http\Controllers\V1\Auth\PasswordResetLinkController;
use App\Http\Controllers\V1\Auth\RegisteredUserController;
use App\Http\Controllers\V1\Auth\VerifyEmailController;
use App\Http\Controllers\V1\DocumentController;
use App\Http\Controllers\V1\ProfileController;
use App\Http\Controllers\V1\VehicleAttributeController;
use App\Http\Controllers\V1\VehicleController;
use Illuminate\Support\Facades\Route;


Route::prefix('auth')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store'])->name('auth.register');
    Route::get('login', [LoginController::class, 'create'])->name('login');
    Route::post('login', [LoginController::class, 'login']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.store');
});

Route::get('vehicle-make', [VehicleAttributeController::class, 'getVehicleMakes'])->name('vehicle-make.index');
Route::get('vehicle-model', [VehicleAttributeController::class, 'getVehicleModels'])->name('vehicle-model.index');

Route::middleware('auth')->group(function (){

    Route::middleware(['verified'])->group(function () {
        Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

    Route::resource('vehicle', VehicleController::class);
   Route::resource('document', DocumentController::class);
});
