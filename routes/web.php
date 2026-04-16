<?php

use App\Http\Controllers\Auth\NewPasswordController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

// All frontend routes are now handled by the React SPA. This file can be left empty or used for fallback if needed.

// Password reset routes
Route::get('reset-password/{token}', function () {
    return view('app');
})->name('password.reset');
Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.update');

Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!telescope(?:/|$)).*');

Broadcast::routes(['middleware' => ['auth:sanctum']]);
