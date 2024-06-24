<?php

namespace App\Http\Controllers;

use App\Http\Requests\V1\RideOffer\RideOfferStoreRequest;
use App\Http\Requests\V1\RideOffer\RideOfferUpdateRequest;
use App\Http\Resources\V1\RideOffer\RideOfferResource;
use App\Models\RideOffer;
use App\Services\V1\RideOffer\RideOfferService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;

class RideOfferController extends Controller
{
    public function __construct(public RideOfferService $rideOfferService)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        return RideOfferResource::collection($this->rideOfferService->getRideOffers());
    }

    public function store(RideOfferStoreRequest $rideOfferStoreRequest): RideOfferResource|JsonResponse
    {
        try {
            $rideOffer = $this->rideOfferService->store(array_merge($rideOfferStoreRequest->safe([
                'vehicle_id',
                'with_driver',
                'price',
                'duration_for'
            ]), [
                'user_id' => auth()->user()->id
            ]));

            return new RideOfferResource($rideOffer);

        }catch (\Exception $e){
            return response()->json([
                'error' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    public function update(RideOffer $rideOffer, RideOfferUpdateRequest $rideOfferUpdateRequest): RideOfferResource|JsonResponse
    {
        try {
            $rideOffer = $this->rideOfferService->update($rideOffer, array_merge($rideOfferUpdateRequest->safe([
                'vehicle_id',
                'with_driver',
                'price',
                'duration_for'
            ]), [
                'user_id' => auth()->user()->id
            ]));

            return new RideOfferResource($rideOffer);

        }catch (\Exception $e){
            return response()->json([
                'error' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}
