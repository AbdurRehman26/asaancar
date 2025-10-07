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
            'car_model_id' => $this->car_model_id,
            'car_type_id' => $this->car_type_id,
            'brand' => new CarBrandResource($this->whenLoaded('carBrand')),
            'carModel' => $this->whenLoaded('carModel', function () {
                return [
                    'id' => $this->carModel->id,
                    'name' => $this->carModel->name,
                    'slug' => $this->carModel->slug,
                    'image' => $this->carModel->image,
                ];
            }),
            'type' => new CarTypeResource($this->whenLoaded('carType')),
            'store' => new StoreResource($this->whenLoaded('store')),
            'tags' => $this->whenLoaded('tags', function () {
                return $this->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'type' => $tag->type,
                        'color' => $tag->color,
                    ];
                });
            }),
            'name' => $this->name,
            'model' => $this->model,
            'year' => $this->year,
            'color' => $this->color,
            'seats' => $this->seats,
            'transmission' => $this->transmission,
            'fuel_type' => $this->fuel_type,
            'description' => $this->description,
            'image' => $this->getImageWithFallback(),
            'images' => $this->image_urls ?? [],
            'image_urls' => $this->image_urls ?? [],
            // Pricing fields for frontend compatibility
            'rental' => $latestOffer ? $latestOffer->price_without_driver : null, // Without driver rate
            'withDriver' => $latestOffer ? $latestOffer->price_with_driver : null, // With driver rate
            'fuel' => 2.50, // Default fuel rate per km
            'overtime' => 25.00, // Default overtime rate per hour
            'currency' => 'PKR', // Default currency
            'price_per_day' => $latestOffer ? $latestOffer->price_without_driver : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Get image with fallback logic: car image -> car model image -> brand image
     */
    private function getImageWithFallback()
    {
        // First priority: Car's own image
        if ($this->image_urls && is_array($this->image_urls) && count($this->image_urls) > 0) {
            return $this->image_urls[0];
        }

        // Second priority: Car model image
        if ($this->relationLoaded('carModel') && $this->carModel && $this->carModel->image) {
            return $this->carModel->image;
        }

        // Third priority: Brand image
        if ($this->relationLoaded('carBrand') && $this->carBrand) {
            $brandName = strtolower($this->carBrand->name);
            return "/images/car-brands/{$brandName}.png";
        }

        // Final fallback: placeholder
        return '/images/car-placeholder.jpeg';
    }
}
