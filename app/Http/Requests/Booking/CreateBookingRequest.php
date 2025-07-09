<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @OA\Schema(
 *     schema="BookingRequest",
 *     title="Booking Request",
 *     description="Booking request data",
 *     required={"car_id", "user_id", "start_date", "end_date", "total_price", "status"},
 *     @OA\Property(property="car_id", type="integer", example=1, description="ID of the car to book"),
 *     @OA\Property(property="user_id", type="integer", example=1, description="ID of the user making the booking"),
 *     @OA\Property(property="start_date", type="string", format="date-time", example="2024-01-01T10:00:00Z", description="Booking start date"),
 *     @OA\Property(property="end_date", type="string", format="date-time", example="2024-01-03T10:00:00Z", description="Booking end date"),
 *     @OA\Property(property="total_price", type="number", format="float", example=150.00, description="Total price for the booking"),
 *     @OA\Property(property="status", type="string", enum={"pending", "confirmed", "cancelled", "completed"}, example="confirmed", description="Booking status"),
 *     @OA\Property(property="notes", type="string", nullable=true, example="Customer requested early pickup", description="Additional notes")
 * )
 */
class CreateBookingRequest extends FormRequest
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
            'user_id' => 'required|exists:users,id',
            'start_date' => 'required|date|after:today',
            'end_date' => 'required|date|after:start_date',
            'total_price' => 'required|numeric|min:0',
            'status' => 'required|in:pending,confirmed,cancelled,completed',
            'notes' => 'nullable|string|max:1000',
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
            'user_id.required' => 'Please select a user.',
            'user_id.exists' => 'The selected user does not exist.',
            'start_date.required' => 'Please select a start date.',
            'start_date.after' => 'Start date must be in the future.',
            'end_date.required' => 'Please select an end date.',
            'end_date.after' => 'End date must be after the start date.',
            'total_price.required' => 'Please enter the total price.',
            'total_price.min' => 'Total price must be at least 0.',
            'status.required' => 'Please select a booking status.',
            'status.in' => 'Please select a valid booking status.',
        ];
    }
}
