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
            'car_brand_id' => $this->car_brand_id,
            'car_type_id' => $this->car_type_id,
            'brand' => new CarBrandResource($this->whenLoaded('carBrand')),
            'type' => new CarTypeResource($this->whenLoaded('carType')),
            'store' => new StoreResource($this->whenLoaded('store')),
            'name' => $this->name,
            'model' => $this->model,
            'year' => $this->year,
            'color' => $this->color,
            'seats' => $this->seats,
            'transmission' => $this->transmission,
            'fuel_type' => $this->fuel_type,
            'description' => $this->description,
            'image' => $this->image_urls && is_array($this->image_urls) && count($this->image_urls) > 0 ? $this->image_urls[0] : null,
            'images' => $this->image_urls ?? [],
            'image_urls' => $this->image_urls ?? [],
            // Pricing fields for frontend compatibility
            'rental' => $latestOffer ? $latestOffer->price_without_driver : 150.00, // Default daily rate
            'withDriver' => $latestOffer ? $latestOffer->price_with_driver : 200.00, // With driver rate
            'fuel' => 2.50, // Default fuel rate per km
            'overtime' => 25.00, // Default overtime rate per hour
            'currency' => 'USD', // Default currency
            'price_per_day' => $latestOffer ? $latestOffer->price_without_driver : 150.00,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
