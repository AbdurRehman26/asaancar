<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RideRequestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'contact' => $this->contact,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone_number' => $this->user->phone_number ?? null,
            ],
            'start_location' => $this->start_location,
            'start_place_id' => $this->start_place_id,
            'start_latitude' => $this->start_latitude,
            'start_longitude' => $this->start_longitude,
            'end_location' => $this->end_location,
            'end_place_id' => $this->end_place_id,
            'end_latitude' => $this->end_latitude,
            'end_longitude' => $this->end_longitude,
            'departure_time' => $this->departure_time,
            'formatted_departure_time' => $this->schedule_type !== 'once'
                ? Carbon::parse($this->departure_time)->format('g:i A')
                : Carbon::parse($this->departure_time)->format('jS F, g:i A'),
            'schedule_type' => $this->schedule_type,
            'selected_days' => $this->selected_days ?? [],
            'selected_days_label' => is_array($this->selected_days)
                ? implode(', ', array_map(fn (string $day): string => substr($day, 0, 3), $this->selected_days))
                : null,
            'is_roundtrip' => $this->is_roundtrip,
            'return_time' => $this->return_time,
            'formatted_return_time' => $this->return_time ? Carbon::parse($this->return_time)->format('g:i A') : null,
            'required_seats' => $this->required_seats,
            'preferred_driver_gender' => $this->preferred_driver_gender,
            'budget_per_seat' => $this->budget_per_seat,
            'currency' => $this->currency,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'is_system_generated' => $this->is_system_generated,
            'created_at' => Carbon::parse($this->created_at)->format('jS F, g:i A'),
            'updated_at' => Carbon::parse($this->updated_at)->toDateTimeString(),
        ];
    }
}
