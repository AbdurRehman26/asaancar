<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'store' => new StoreResource($this->whenLoaded('store')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'roles' => $this->getRoleNames(),
        ];
    }
} 