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
        return [
            'id' => $this->id,
            'brand' => new CarBrandResource($this->whenLoaded('brand')),
            'type' => new CarTypeResource($this->whenLoaded('type')),
            'engine' => new CarEngineResource($this->whenLoaded('engine')),
            'store' => new StoreResource($this->whenLoaded('store')),
            'name' => $this->name,
            'model' => $this->model,
            'year' => $this->year,
            'price_per_day' => $this->price_per_day,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
} 