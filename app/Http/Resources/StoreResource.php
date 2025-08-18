<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StoreResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'store_username' => $this->store_username,
            'description' => $this->description,
            'logo_url' => $this->logo_url,
            'city_id' => $this->city_id,
            'contact_phone' => $this->contact_phone,
            'address' => $this->address,
            'city' => $this->city ? $this->city->name : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
} 