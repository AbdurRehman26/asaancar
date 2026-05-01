<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CancelLiveRideRequest;
use App\Http\Requests\CompleteLiveRideRequest;
use App\Http\Requests\RejectLiveRideRequest;
use App\Http\Resources\LiveRideRequestResource;
use App\Models\LiveRideRequest;
use App\Services\LiveRideDispatcher;
use App\Services\LiveRideStateManager;
use Illuminate\Http\Request;

class DriverLiveRideController extends Controller
{
    public function incoming(Request $request, LiveRideDispatcher $dispatcher)
    {
        $rides = $dispatcher->incomingForDriver($request->user()->id);

        return response()->json([
            'data' => LiveRideRequestResource::collection($rides),
            'message' => 'Incoming live rides fetched successfully.',
        ]);
    }

    public function accept(LiveRideRequest $liveRideRequest, LiveRideStateManager $stateManager)
    {
        $liveRideRequest = $stateManager->accept($liveRideRequest, auth()->user());

        return response()->json([
            'data' => new LiveRideRequestResource($liveRideRequest),
            'message' => 'Live ride accepted successfully.',
        ]);
    }

    public function reject(
        RejectLiveRideRequest $request,
        LiveRideRequest $liveRideRequest,
        LiveRideStateManager $stateManager,
        LiveRideDispatcher $dispatcher,
    ) {
        $liveRideRequest = $stateManager->reject($liveRideRequest, $request->user(), $request->validated('reason'));
        $dispatcher->dispatch($liveRideRequest);

        return response()->json([
            'data' => new LiveRideRequestResource($liveRideRequest),
            'message' => 'Live ride rejected successfully.',
        ]);
    }

    public function arrived(LiveRideRequest $liveRideRequest, LiveRideStateManager $stateManager)
    {
        $this->authorize('manageAsDriver', $liveRideRequest);

        $liveRideRequest = $stateManager->markDriverArrived($liveRideRequest, auth()->user());

        return response()->json([
            'data' => new LiveRideRequestResource($liveRideRequest),
            'message' => 'Live ride marked as driver arrived.',
        ]);
    }

    public function start(LiveRideRequest $liveRideRequest, LiveRideStateManager $stateManager)
    {
        $this->authorize('manageAsDriver', $liveRideRequest);

        $liveRideRequest = $stateManager->startRide($liveRideRequest, auth()->user());

        return response()->json([
            'data' => new LiveRideRequestResource($liveRideRequest),
            'message' => 'Live ride started successfully.',
        ]);
    }

    public function complete(
        CompleteLiveRideRequest $request,
        LiveRideRequest $liveRideRequest,
        LiveRideStateManager $stateManager,
    ) {
        $this->authorize('manageAsDriver', $liveRideRequest);

        $liveRideRequest = $stateManager->completeRide(
            $liveRideRequest,
            $request->user(),
            $request->filled('final_fare') ? (float) $request->validated('final_fare') : null,
        );

        return response()->json([
            'data' => new LiveRideRequestResource($liveRideRequest),
            'message' => 'Live ride completed successfully.',
        ]);
    }

    public function cancel(
        CancelLiveRideRequest $request,
        LiveRideRequest $liveRideRequest,
        LiveRideStateManager $stateManager,
    ) {
        $this->authorize('manageAsDriver', $liveRideRequest);

        $liveRideRequest = $stateManager->cancelByDriver($liveRideRequest, $request->user(), $request->validated('reason'));

        return response()->json([
            'data' => new LiveRideRequestResource($liveRideRequest),
            'message' => 'Live ride cancelled successfully.',
        ]);
    }
}
