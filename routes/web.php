<?php

use Illuminate\Support\Facades\Route;
// All frontend routes are now handled by the React SPA. This file can be left empty or used for fallback if needed.

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
