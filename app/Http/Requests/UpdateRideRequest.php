<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'contact' => ['sometimes', 'nullable', 'string', 'max:255'],
            'start_location' => ['sometimes', 'string', 'max:255'],
            'start_place_id' => ['sometimes', 'nullable', 'string', 'max:255'],
            'start_latitude' => ['sometimes', 'nullable', 'numeric'],
            'start_longitude' => ['sometimes', 'nullable', 'numeric'],
            'end_location' => ['sometimes', 'string', 'max:255'],
            'end_place_id' => ['sometimes', 'nullable', 'string', 'max:255'],
            'end_latitude' => ['sometimes', 'nullable', 'numeric'],
            'end_longitude' => ['sometimes', 'nullable', 'numeric'],
            'departure_date' => [
                'sometimes',
                Rule::requiredIf(fn (): bool => $this->input('schedule_type') === 'once'),
                'date_format:Y-m-d',
            ],
            'departure_time' => ['sometimes', 'date_format:H:i'],
            'schedule_type' => ['sometimes', 'string', 'in:once,everyday,weekdays,weekends,custom'],
            'selected_days' => ['sometimes', 'nullable', 'array'],
            'selected_days.*' => ['string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'is_roundtrip' => ['sometimes', 'boolean'],
            'return_time' => ['sometimes', 'nullable', 'date_format:H:i'],
            'required_seats' => ['sometimes', 'integer', 'min:1', 'max:4'],
            'preferred_driver_gender' => ['sometimes', 'in:male,female,any'],
            'budget_per_seat' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'currency' => ['sometimes', 'nullable', 'string', 'max:8'],
            'description' => ['sometimes', 'nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
