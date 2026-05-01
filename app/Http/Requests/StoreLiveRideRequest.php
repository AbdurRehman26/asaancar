<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLiveRideRequest extends FormRequest
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
            'pickup_place_id' => ['nullable', 'string', 'max:255'],
            'pickup_location' => ['required', 'string', 'max:255'],
            'pickup_latitude' => ['required', 'numeric', 'between:-90,90'],
            'pickup_longitude' => ['required', 'numeric', 'between:-180,180'],
            'dropoff_place_id' => ['nullable', 'string', 'max:255'],
            'dropoff_location' => ['required', 'string', 'max:255'],
            'dropoff_latitude' => ['required', 'numeric', 'between:-90,90'],
            'dropoff_longitude' => ['required', 'numeric', 'between:-180,180'],
            'estimated_fare' => ['required', 'numeric', 'min:1'],
            'vehicle_type' => ['nullable', 'string', Rule::in(['bike', 'mini', 'go', 'xl'])],
        ];
    }
}
