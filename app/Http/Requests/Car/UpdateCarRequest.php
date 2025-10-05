<?php

namespace App\Http\Requests\Car;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCarRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'car_brand_id' => 'required|exists:car_brands,id',
            'car_type_id' => 'required|exists:car_types,id',

            'store_id' => 'required|exists:stores,id',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1990|max:2025',
            'color' => 'required|string|max:255',
            'seats' => 'required|integer|min:1|max:20',
            'transmission' => 'required|in:manual,automatic',
            'fuel_type' => 'required|in:petrol,diesel,electric,hybrid',
            'description' => 'nullable|string|max:1000',
            'image_urls' => 'nullable|array',
            'image_urls.*' => 'string|url',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'car_brand_id.required' => 'Please select a car brand.',
            'car_type_id.required' => 'Please select a car type.',

            'store_id.required' => 'Please select a store.',
            'model.required' => 'Please enter the car model.',
            'year.required' => 'Please enter the car year.',
            'year.min' => 'Car year must be at least 1990.',
            'year.max' => 'Car year cannot be later than 2025.',
            'color.required' => 'Please select a car color.',
            'seats.required' => 'Please enter the number of seats.',
            'seats.min' => 'Car must have at least 1 seat.',
            'seats.max' => 'Car cannot have more than 20 seats.',
            'transmission.required' => 'Please select a transmission type.',
            'fuel_type.required' => 'Please select a fuel type.',
        ];
    }
}
