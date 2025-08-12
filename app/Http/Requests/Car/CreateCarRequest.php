<?php

namespace App\Http\Requests\Car;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @OA\Schema(
 *     schema="CarRequest",
 *     title="Car Request",
 *     description="Car request data",
 *     required={"car_brand_id", "car_type_id", "car_engine_id", "store_id", "model", "year", "color", "seats", "transmission", "fuel_type"},
 *     @OA\Property(property="car_brand_id", type="integer", example=1),
 *     @OA\Property(property="car_type_id", type="integer", example=1),
 *     @OA\Property(property="car_engine_id", type="integer", example=1),
 *     @OA\Property(property="store_id", type="integer", example=1),
 *     @OA\Property(property="model", type="string", example="Civic"),
 *     @OA\Property(property="year", type="integer", example=2020),
 *     @OA\Property(property="color", type="string", example="blue"),
 *     @OA\Property(property="seats", type="integer", example=5),
 *     @OA\Property(property="transmission", type="string", enum={"manual", "automatic"}),
 *     @OA\Property(property="fuel_type", type="string", enum={"petrol", "diesel", "electric", "hybrid"}),
 *     @OA\Property(property="description", type="string", example="A reliable car for daily use"),
 *     @OA\Property(property="image_urls", type="array", @OA\Items(type="string", format="binary"))
 * )
 */
class CreateCarRequest extends FormRequest
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
            'name' => 'sometimes|string|max:255',
            'car_brand_id' => 'required|exists:car_brands,id',
            'car_type_id' => 'required|exists:car_types,id',
            'car_engine_id' => 'required|exists:car_engines,id',
            'store_id' => 'required|exists:stores,id',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1990|max:2025',
            'color' => 'required|string|max:255',
            'seats' => 'required|integer|min:1|max:20',
            'transmission' => 'required|in:manual,automatic',
            'fuel_type' => 'required|in:petrol,diesel,electric,hybrid',
            'description' => 'nullable|string|max:1000',
            'image_urls' => 'nullable|array',
            'image_urls.*' => 'url',
            'with_driver_rate' => 'nullable|numeric|min:0',
            'without_driver_rate' => 'nullable|numeric|min:0',
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
            'car_engine_id.required' => 'Please select a car engine.',
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
