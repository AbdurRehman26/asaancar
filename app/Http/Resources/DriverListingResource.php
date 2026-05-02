<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="DriverLatestService",
 *     title="Driver Latest Service",
 *     description="Latest active pick and drop service summary for a driver",
 *
 *     @OA\Property(property="id", type="integer", example=17),
 *     @OA\Property(property="start_location", type="string", example="Lyari"),
 *     @OA\Property(property="end_location", type="string", example="Surjani Town"),
 *     @OA\Property(property="formatted_departure_time", type="string", example="2nd May, 10:00 AM"),
 *     @OA\Property(property="driver_gender", type="string", enum={"male", "female"}, example="male"),
 *     @OA\Property(property="price_per_person", type="number", format="float", example=250),
 *     @OA\Property(property="currency", type="string", example="PKR")
 * )
 *
 * @OA\Schema(
 *     schema="DriverListing",
 *     title="Driver Listing",
 *     description="Public driver listing payload",
 *
 *     @OA\Property(property="id", type="integer", example=12),
 *     @OA\Property(property="name", type="string", example="Dr. Sami"),
 *     @OA\Property(property="phone_number", type="string", nullable=true, example="03001234567"),
 *     @OA\Property(property="profile_image", type="string", nullable=true, example="https://example.com/profile.jpg"),
 *     @OA\Property(property="active_services_count", type="integer", example=3),
 *     @OA\Property(property="latest_service", ref="#/components/schemas/DriverLatestService", nullable=true)
 * )
 */
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
