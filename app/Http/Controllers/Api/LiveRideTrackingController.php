<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DriverLocationResource;
use App\Http\Resources\RideDispatchEventResource;
use App\Models\LiveRideRequest;
use Illuminate\Http\Request;

class LiveRideTrackingController extends Controller
{
    public function tracking(Request $request, LiveRideRequest $liveRideRequest)
    {
        $this->authorize('view', $liveRideRequest);

        $liveRideRequest->load(['latestDriverLocation']);

        return response()->json([
            'data' => [
                'id' => $liveRideRequest->id,
                'status' => $liveRideRequest->status,
                'pickup_location' => $liveRideRequest->pickup_location,
                'pickup_latitude' => (float) $liveRideRequest->pickup_latitude,
                'pickup_longitude' => (float) $liveRideRequest->pickup_longitude,
                'dropoff_location' => $liveRideRequest->dropoff_location,
                'dropoff_latitude' => (float) $liveRideRequest->dropoff_latitude,
                'dropoff_longitude' => (float) $liveRideRequest->dropoff_longitude,
                'eta_minutes' => $liveRideRequest->eta_minutes,
                'latest_driver_location' => $liveRideRequest->latestDriverLocation
                    ? (new DriverLocationResource($liveRideRequest->latestDriverLocation))->resolve()
                    : null,
            ],
            'message' => 'Live ride tracking fetched successfully.',
        ]);
    }

    public function timeline(Request $request, LiveRideRequest $liveRideRequest)
    {
        $this->authorize('view', $liveRideRequest);

        $liveRideRequest->load('dispatchEvents.actor');

        return response()->json([
            'data' => RideDispatchEventResource::collection($liveRideRequest->dispatchEvents),
            'message' => 'Live ride timeline fetched successfully.',
        ]);
    }
}
