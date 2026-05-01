<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CancelLiveRideRequest;
use App\Http\Requests\StoreLiveRideRequest;
use App\Http\Resources\LiveRideRequestResource;
use App\Models\LiveRideRequest;
use App\Services\LiveRideDispatcher;
use App\Services\LiveRideEstimator;
use App\Services\LiveRideStateManager;
use Illuminate\Http\Request;

class CustomerLiveRideController extends Controller
{
    public function store(
        StoreLiveRideRequest $request,
        LiveRideEstimator $estimator,
        LiveRideStateManager $stateManager,
        LiveRideDispatcher $dispatcher,
    ) {
        $estimate = $estimator->estimate($request->validated());

        $liveRideRequest = $stateManager->createRequest($request->user(), array_merge(
            $request->validated(),
            $estimate,
        ));

        $dispatcher->dispatch($liveRideRequest);

        return response()->json([
            'data' => new LiveRideRequestResource($liveRideRequest->fresh(['rider', 'driver', 'latestDriverLocation', 'dispatchEvents.actor'])),
            'message' => 'Live ride request created successfully.',
        ], 201);
    }

    public function active(Request $request)
    {
        $liveRideRequest = LiveRideRequest::query()
            ->with(['rider', 'driver', 'latestDriverLocation', 'dispatchEvents.actor'])
            ->where('rider_user_id', $request->user()->id)
            ->whereIn('status', LiveRideRequest::ACTIVE_STATUSES)
            ->latest('requested_at')
            ->first();

        return response()->json([
            'data' => $liveRideRequest ? new LiveRideRequestResource($liveRideRequest) : null,
            'message' => $liveRideRequest ? 'Active live ride fetched successfully.' : 'No active live ride found.',
        ]);
    }

    public function show(Request $request, LiveRideRequest $liveRideRequest)
    {
        $this->authorize('view', $liveRideRequest);

        $liveRideRequest->load(['rider', 'driver', 'latestDriverLocation', 'dispatchEvents.actor']);

        return response()->json([
            'data' => new LiveRideRequestResource($liveRideRequest),
            'message' => 'Live ride fetched successfully.',
        ]);
    }

    public function cancel(
        CancelLiveRideRequest $request,
        LiveRideRequest $liveRideRequest,
        LiveRideStateManager $stateManager,
    ) {
        $this->authorize('cancelByRider', $liveRideRequest);

        $liveRideRequest = $stateManager->cancelByRider($liveRideRequest, $request->user(), $request->validated('reason'));

        return response()->json([
            'data' => new LiveRideRequestResource($liveRideRequest),
            'message' => 'Live ride cancelled successfully.',
        ]);
    }
}
