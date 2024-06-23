<?php

namespace App\Http\Requests\V1\Vehicle;

use Illuminate\Foundation\Http\FormRequest;

class VehicleStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_type_id' => ['required', 'exists:vehicle_types,id'],
            'vehicle_model_id' => ['required', 'exists:vehicle_models,id'],
            'details' => ['sometimes'],
            'color' => ['required'],
            'number_plate' => ['required'],
            'year_of_manufacture' => ['required', 'date']
        ];
    }
}
