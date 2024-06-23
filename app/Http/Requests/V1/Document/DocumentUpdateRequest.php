<?php

namespace App\Http\Requests\V1\Document;

use Illuminate\Foundation\Http\FormRequest;

class DocumentUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'documentable_id' => ['required'],
            'documentable_type' => ['required'],
            'document_type' => ['required'],
            'document_url' => ['required', 'string']
        ];
    }
}
