<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RideDispatchEventResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_type' => $this->event_type,
            'actor' => $this->actor ? [
                'id' => $this->actor->id,
                'name' => $this->actor->name,
                'phone_number' => $this->actor->phone_number,
                'profile_image' => $this->actor->profile_image,
            ] : null,
            'payload' => $this->payload,
            'occurred_at' => $this->occurred_at?->toISOString(),
        ];
    }
}
