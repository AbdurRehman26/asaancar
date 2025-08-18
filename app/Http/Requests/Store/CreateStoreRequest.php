<?php

namespace App\Http\Requests\Store;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @OA\Schema(
 *     schema="StoreRequest",
 *     title="Store Request",
 *     description="Store request data",
 *     required={"name", "store_username"},
 *     @OA\Property(property="name", type="string", example="Downtown Car Rental"),
 *     @OA\Property(property="store_username", type="string", example="downtown_rental"),
 *     @OA\Property(property="description", type="string", example="Premium car rental service"),
 *     @OA\Property(property="address", type="string", example="123 Main St"),
 *     @OA\Property(property="phone", type="string", example="+1234567890"),
 *     @OA\Property(property="email", type="string", example="info@downtown.com")
 * )
 */
class CreateStoreRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'store_username' => 'nullable|string|max:255|unique:stores,store_username',
            'description' => 'nullable|string|max:1000',
            'address' => 'nullable|string|max:500',
            'contact_phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'city_id' => 'nullable|integer|exists:cities,id',
            'logo_url' => 'nullable|url',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please enter the store name.',
            'email.email' => 'Please enter a valid email address.',
        ];
    }
}
