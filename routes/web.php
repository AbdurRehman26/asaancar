<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
// All frontend routes are now handled by the React SPA. This file can be left empty or used for fallback if needed.

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

Broadcast::routes(['middleware' => ['auth:sanctum']]);
