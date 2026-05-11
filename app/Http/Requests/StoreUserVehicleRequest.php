<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'vehicle_type' => ['required', 'in:car,bike'],
            'brand' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:255'],
            'seats' => ['nullable', 'integer', 'min:1', 'max:12'],
            'transmission' => ['nullable', 'in:manual,automatic'],
            'fuel_type' => ['nullable', 'in:petrol,diesel,electric,hybrid'],
            'is_default' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_type.required' => 'Please choose whether this vehicle is a car or bike.',
            'vehicle_type.in' => 'Vehicle type must be car or bike.',
        ];
    }
}
