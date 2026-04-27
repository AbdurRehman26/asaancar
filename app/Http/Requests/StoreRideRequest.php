<?php

namespace App\Http\Requests;

use App\Support\DepartureDateNormalizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRideRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (! $this->exists('departure_date')) {
            return;
        }

        $this->merge([
            'departure_date' => DepartureDateNormalizer::normalize($this->input('departure_date')),
        ]);
    }

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
            'name' => ['nullable', 'string', 'max:255'],
            'contact' => ['nullable', 'string', 'max:255'],
            'start_location' => ['required', 'string', 'max:255'],
            'start_place_id' => ['nullable', 'string', 'max:255'],
            'start_latitude' => ['nullable', 'numeric'],
            'start_longitude' => ['nullable', 'numeric'],
            'end_location' => ['required', 'string', 'max:255'],
            'end_place_id' => ['nullable', 'string', 'max:255'],
            'end_latitude' => ['nullable', 'numeric'],
            'end_longitude' => ['nullable', 'numeric'],
            'departure_date' => [
                Rule::requiredIf(fn (): bool => $this->input('schedule_type', 'once') === 'once'),
                'date_format:Y-m-d',
            ],
            'departure_time' => ['required', 'date_format:H:i'],
            'schedule_type' => ['nullable', 'string', 'in:once,everyday,weekdays,weekends,custom'],
            'selected_days' => ['nullable', 'array'],
            'selected_days.*' => ['string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'is_roundtrip' => ['boolean'],
            'return_time' => ['nullable', 'date_format:H:i'],
            'required_seats' => ['required', 'integer', 'min:1', 'max:4'],
            'preferred_driver_gender' => ['required', 'in:male,female,any'],
            'budget_per_seat' => ['nullable', 'integer', 'min:1'],
            'currency' => ['nullable', 'string', 'max:8'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
