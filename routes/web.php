<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\Auth\NewPasswordController;
// All frontend routes are now handled by the React SPA. This file can be left empty or used for fallback if needed.

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

Broadcast::routes(['middleware' => ['auth:sanctum']]);

// Password reset routes
Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.update');
