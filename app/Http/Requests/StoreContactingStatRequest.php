<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreContactingStatRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'recipient_user_id' => ['required', 'integer', 'exists:users,id'],
            'contactable_type' => ['required', 'string', 'in:pick_and_drop,ride_request'],
            'contactable_id' => ['required', 'integer', 'min:1'],
            'contact_method' => ['required', 'string', 'in:call,whatsapp,chat'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'recipient_user_id.required' => 'The recipient is required.',
            'recipient_user_id.exists' => 'The selected recipient is invalid.',
            'contactable_type.in' => 'The selected contact target is invalid.',
            'contact_method.in' => 'The selected contact method is invalid.',
        ];
    }
}
