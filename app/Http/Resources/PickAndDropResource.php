<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PickAndDropResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
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
            'car' => $this->car ? [
                'id' => $this->car->id,
                'name' => $this->car->name,
            ] : null,
            'start_location' => $this->start_location,
            'start_area' => $this->start_area,
            'start_place_id' => $this->start_place_id,
            'start_latitude' => $this->start_latitude,
            'start_longitude' => $this->start_longitude,
            'end_location' => $this->end_location,
            'end_area' => $this->end_area,
            'end_place_id' => $this->end_place_id,
            'end_latitude' => $this->end_latitude,
            'end_longitude' => $this->end_longitude,
            'pickup_city_id' => $this->pickup_city_id,
            'dropoff_city_id' => $this->dropoff_city_id,
            'pickup_area_id' => $this->pickup_area_id,
            'dropoff_area_id' => $this->dropoff_area_id,
            'pickup_city' => $this->whenLoaded('pickupCity', function () {
                return [
                    'id' => $this->pickupCity->id,
                    'name' => $this->pickupCity->name,
                ];
            }),
            'dropoff_city' => $this->whenLoaded('dropoffCity', function () {
                return [
                    'id' => $this->dropoffCity->id,
                    'name' => $this->dropoffCity->name,
                ];
            }),
            'pickup_area' => $this->whenLoaded('pickupArea', function () {
                return [
                    'id' => $this->pickupArea->id,
                    'name' => $this->pickupArea->name,
                ];
            }),
            'dropoff_area' => $this->whenLoaded('dropoffArea', function () {
                return [
                    'id' => $this->dropoffArea->id,
                    'name' => $this->dropoffArea->name,
                ];
            }),
            'available_spaces' => $this->available_spaces,
            'driver_gender' => $this->driver_gender,
            'car_brand' => $this->car_brand,
            'car_model' => $this->car_model,
            'car_color' => $this->car_color,
            'car_seats' => $this->car_seats,
            'car_transmission' => $this->car_transmission,
            'car_fuel_type' => $this->car_fuel_type,
            'departure_time' => $this->departure_time,
            'formatted_departure_time' => $this->schedule_type != 'once' ? Carbon::parse($this->departure_time)->format('g:i A') : Carbon::parse($this->departure_time)->format('jS F, g:i A'),
            'description' => $this->description,
            'price_per_person' => $this->price_per_person,
            'currency' => $this->currency,
            'is_active' => $this->is_active,
            'is_system_generated' => $this->is_system_generated,
            'is_everyday' => $this->schedule_type != 'once' ?? false,
            'stops' => $this->whenLoaded('stops', function () {
                return $this->stops->map(function ($stop) {
                    return [
                        'id' => $stop->id,
                        'location' => $stop->location,
                        'stop_area' => $stop->stop_area,
                        'place_id' => $stop->place_id,
                        'latitude' => $stop->latitude,
                        'longitude' => $stop->longitude,
                        'city_id' => $stop->city_id,
                        'area_id' => $stop->area_id,
                        'city' => ($stop->relationLoaded('city') && $stop->city) ? [
                            'id' => $stop->city->id,
                            'name' => $stop->city->name,
                        ] : null,
                        'area' => ($stop->relationLoaded('area') && $stop->area) ? [
                            'id' => $stop->area->id,
                            'name' => $stop->area->name,
                        ] : null,
                        'stop_time' => $this->schedule_type != 'once' ? Carbon::parse($stop->stop_time)->format('g:i A') : Carbon::parse($stop->stop_time)->format('jS F, g:i A'),
                        'raw_stop_time' => $stop->stop_time,
                        'order' => $stop->order,
                        'notes' => $stop->notes,
                    ];
                });
            }),
            'schedule_type' => $this->schedule_type,
            'selected_days' => is_array($this->selected_days) ? implode(', ', array_map(function ($day) {
                return substr($day, 0, 3);
            }, $this->selected_days ?? [])) : [],
            'is_roundtrip' => $this->is_roundtrip ?? false,
            'is_favorited' => $request->user('sanctum') ? $this->favoritedByUsers()->where('user_id', $request->user('sanctum')->id)->exists() : false,
            'return_time' => $this->return_time,
            'formatted_return_time' => $this->return_time ? Carbon::parse($this->return_time)->format('g:i A') : null,
            'created_at' => Carbon::parse($this->created_at)->format('jS F, g:i A'),
            'updated_at' => Carbon::parse($this->updated_at)->toDateTimeString(),
        ];
    }
}
