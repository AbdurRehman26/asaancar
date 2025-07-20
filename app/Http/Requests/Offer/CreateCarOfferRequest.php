<?php

namespace App\Http\Requests\Offer;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @OA\Schema(
 *     schema="CarOfferRequest",
 *     title="Car Offer Request",
 *     description="Car offer request data",
 *     required={"car_id", "discount_percentage", "start_date", "end_date"},
 *     @OA\Property(property="car_id", type="integer", example=1, description="ID of the car for the offer"),
 *     @OA\Property(property="discount_percentage", type="number", format="float", example=20.00, description="Discount percentage (0-100)"),
 *     @OA\Property(property="currency", type="string", example="PKR", description="Currency code (3 characters)"),
 *     @OA\Property(property="start_date", type="string", format="date-time", example="2024-06-01T00:00:00Z", description="Offer start date"),
 *     @OA\Property(property="end_date", type="string", format="date-time", example="2024-08-31T23:59:59Z", description="Offer end date"),
 *     @OA\Property(property="is_active", type="boolean", example=true, description="Whether the offer is active")
 * )
 */
class CreateCarOfferRequest extends FormRequest
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
            'car_id' => 'required|exists:cars,id',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'currency' => 'nullable|string|size:3',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'car_id.required' => 'Please select a car.',
            'car_id.exists' => 'The selected car does not exist.',
            'discount_percentage.required' => 'Please enter the discount percentage.',
            'discount_percentage.min' => 'Discount percentage must be at least 0%.',
            'discount_percentage.max' => 'Discount percentage cannot exceed 100%.',
            'currency.size' => 'Currency must be exactly 3 characters.',
            'start_date.required' => 'Please select a start date.',
            'end_date.required' => 'Please select an end date.',
            'end_date.after' => 'End date must be after the start date.',
        ];
    }
}
