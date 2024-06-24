<?php

namespace App\Http\Resources\V1\RideOffer;

use App\Models\RideOfferDetail;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/* @mixin RideOfferDetail */

class RideOfferDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'duration_for' => $this->duration_for,
            'with_driver' => $this->with_driver,
            'price' => $this->price
        ];
    }
}
