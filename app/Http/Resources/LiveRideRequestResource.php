<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LiveRideRequestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'pickup_place_id' => $this->pickup_place_id,
            'pickup_location' => $this->pickup_location,
            'pickup_latitude' => (float) $this->pickup_latitude,
            'pickup_longitude' => (float) $this->pickup_longitude,
            'dropoff_place_id' => $this->dropoff_place_id,
            'dropoff_location' => $this->dropoff_location,
            'dropoff_latitude' => (float) $this->dropoff_latitude,
            'dropoff_longitude' => (float) $this->dropoff_longitude,
            'vehicle_type' => $this->vehicle_type,
            'estimated_fare' => (float) $this->estimated_fare,
            'final_fare' => $this->final_fare !== null ? (float) $this->final_fare : null,
            'distance_km' => $this->distance_km !== null ? (float) $this->distance_km : null,
            'eta_minutes' => $this->eta_minutes,
            'currency' => $this->currency,
            'rider' => $this->rider ? $this->userPayload($this->rider) : null,
            'driver' => $this->driver ? $this->userPayload($this->driver) : null,
            'latest_driver_location' => $this->whenLoaded('latestDriverLocation', function () {
                return $this->latestDriverLocation ? (new DriverLocationResource($this->latestDriverLocation))->resolve() : null;
            }),
            'status_timeline' => $this->whenLoaded('dispatchEvents', function () {
                return RideDispatchEventResource::collection($this->dispatchEvents)->resolve();
            }),
            'requested_at' => $this->requested_at?->toISOString(),
            'accepted_at' => $this->accepted_at?->toISOString(),
            'arrived_at' => $this->arrived_at?->toISOString(),
            'started_at' => $this->started_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'cancelled_by' => $this->cancelled_by,
            'cancellation_reason' => $this->cancellation_reason,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function userPayload(object $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'phone_number' => $user->phone_number,
            'profile_image' => $user->profile_image,
        ];
    }
}
