<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateDriverAvailabilityRequest;
use App\Services\LiveRideStateManager;

class DriverAvailabilityController extends Controller
{
    public function store(UpdateDriverAvailabilityRequest $request, LiveRideStateManager $stateManager)
    {
        $availability = $stateManager->updateDriverAvailability($request->user(), $request->validated());

        return response()->json([
            'data' => [
                'driver_user_id' => $availability->driver_user_id,
                'is_online' => $availability->is_online,
                'is_available' => $availability->is_available,
                'vehicle_type' => $availability->vehicle_type,
                'last_seen_at' => $availability->last_seen_at?->toISOString(),
            ],
            'message' => 'Driver availability updated successfully.',
        ]);
    }
}
