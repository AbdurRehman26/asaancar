<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDriverAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'is_online' => ['required', 'boolean'],
            'is_available' => ['required', 'boolean'],
            'vehicle_type' => ['nullable', 'string', Rule::in(['bike', 'mini', 'go', 'xl'])],
        ];
    }
}
