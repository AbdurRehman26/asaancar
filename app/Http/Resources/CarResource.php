<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CarResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        // Get the latest active car offer for pricing
        $latestOffer = $this->carOffers()
            ->where('available_from', '<=', now())
            ->where('available_to', '>=', now())
            ->latest()
            ->first();

        return [
            'id' => $this->id,
            'store_id' => $this->store_id,
            'brand' => new CarBrandResource($this->whenLoaded('brand')),
            'type' => new CarTypeResource($this->whenLoaded('type')),
            'engine' => new CarEngineResource($this->whenLoaded('engine')),
            'store' => new StoreResource($this->whenLoaded('store')),
            'name' => $this->name,
            'model' => $this->model,
            'year' => $this->year,
            // Pricing fields for frontend compatibility
            'rental' => $latestOffer ? $latestOffer->price_without_driver : 150.00, // Default daily rate
            'baseFare' => $latestOffer ? $latestOffer->price_with_driver : 200.00, // Default with driver rate
            'fuel' => 2.50, // Default fuel rate per km
            'overtime' => 25.00, // Default overtime rate per hour
            'currency' => 'USD', // Default currency
            'price_per_day' => $latestOffer ? $latestOffer->price_without_driver : 150.00,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
} 