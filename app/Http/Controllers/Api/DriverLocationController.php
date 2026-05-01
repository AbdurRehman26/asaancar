<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDriverLocationRequest;
use App\Http\Resources\DriverLocationResource;
use App\Services\LiveRideStateManager;

class DriverLocationController extends Controller
{
    public function store(StoreDriverLocationRequest $request, LiveRideStateManager $stateManager)
    {
        $location = $stateManager->updateDriverLocation($request->user(), $request->validated());

        return response()->json([
            'data' => new DriverLocationResource($location),
            'message' => 'Driver location updated successfully.',
        ]);
    }
}
