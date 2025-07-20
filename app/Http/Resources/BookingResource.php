<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'car' => new CarResource($this->whenLoaded('car')),
            'user' => new UserResource($this->whenLoaded('user')),
            'store' => new StoreResource($this->whenLoaded('store')),
            'pickup_location' => $this->pickup_location,
            'rental_type' => $this->rental_type,
            'pickup_date' => $this->pickup_date,
            'pickup_time' => $this->pickup_time,
            'total_price' => $this->total_price,
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
