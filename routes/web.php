<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\Auth\NewPasswordController;
// All frontend routes are now handled by the React SPA. This file can be left empty or used for fallback if needed.

// Password reset routes
Route::get('reset-password/{token}', function () {
    return view('app');
})->name('password.reset');
Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.update');

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

Broadcast::routes(['middleware' => ['auth:sanctum']]);
