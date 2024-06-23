<?php

namespace App\Http\Resources\V1;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/* @mixin Document */

class DocumentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'documentable' => $this->documentable,
            'document_type' => $this->document_type,
            'document_url' => $this->document_url,
            'is_verified' => $this->is_verified,
            'details' => $this->details
        ];
    }
}
