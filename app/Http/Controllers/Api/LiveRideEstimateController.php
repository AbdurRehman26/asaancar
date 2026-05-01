<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EstimateLiveRideRequest;
use App\Services\LiveRideEstimator;

class LiveRideEstimateController extends Controller
{
    public function store(EstimateLiveRideRequest $request, LiveRideEstimator $estimator)
    {
        return response()->json([
            'data' => $estimator->estimate($request->validated()),
            'message' => 'Live ride estimate generated successfully.',
        ]);
    }
}
