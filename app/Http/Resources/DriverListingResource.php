<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DriverListingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $latestService = $this->relationLoaded('latestActivePickAndDrop') ? $this->latestActivePickAndDrop : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone_number' => $request->user('sanctum') ? $this->phone_number : null,
            'profile_image' => $this->profile_image,
            'active_services_count' => $this->active_pick_and_drop_services_count ?? 0,
            'latest_service' => $latestService ? [
                'id' => $latestService->id,
                'start_location' => $latestService->start_location,
                'end_location' => $latestService->end_location,
                'formatted_departure_time' => $latestService->schedule_type !== 'once'
                    ? Carbon::parse($latestService->departure_time)->format('g:i A')
                    : Carbon::parse($latestService->departure_time)->format('jS F, g:i A'),
                'driver_gender' => $latestService->driver_gender,
                'price_per_person' => $latestService->price_per_person,
                'currency' => $latestService->currency,
            ] : null,
        ];
    }
}
