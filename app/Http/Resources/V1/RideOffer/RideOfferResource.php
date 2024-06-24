<?php

namespace App\Http\Resources\V1\RideOffer;

use App\Http\Resources\V1\UserResource;
use App\Http\Resources\V1\Vehicle\VehicleResource;
use App\Models\RideOffer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/* @mixin RideOffer */

class RideOfferResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'vehicle' => new VehicleResource($this->vehicle),
            'user' => new UserResource($this->user),
            'details' => RideOfferDetailResource::collection($this->rideOfferDetails)
        ];
    }
}
