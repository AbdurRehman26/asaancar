<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DriverLocationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'driver_user_id' => $this->driver_user_id,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'heading' => $this->heading !== null ? (float) $this->heading : null,
            'speed' => $this->speed !== null ? (float) $this->speed : null,
            'accuracy' => $this->accuracy !== null ? (float) $this->accuracy : null,
            'recorded_at' => $this->recorded_at?->toISOString(),
        ];
    }
}
