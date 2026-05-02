<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'gender' => ['sometimes', 'nullable', 'in:male,female'],
            'city_id' => ['sometimes', 'nullable', 'integer', 'exists:cities,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'gender.in' => 'The gender must be male or female.',
            'city_id.exists' => 'The selected city does not exist.',
        ];
    }
}
