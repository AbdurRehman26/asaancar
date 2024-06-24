<?php

namespace App\Http\Resources\V1\Booking;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/* @mixin Booking */

class BookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'ride_offer' => $this->rideOffer,
            'booking_status' => $this->bookingStatus,
            'from_location' => $this->from_location,
            'to_location' => $this->to_location,
            'from_date_time' => $this->from_date_time,
            'to_date_time' => $this->to_date_time,
        ];
    }
}
