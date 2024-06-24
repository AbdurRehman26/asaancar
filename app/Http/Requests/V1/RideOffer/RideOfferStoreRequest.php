<?php

namespace App\Http\Requests\V1\RideOffer;

use App\Models\RideOfferDetail;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RideOfferStoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'user_id' => ['required', 'exists:users,id'],
            'duration_for' => ['required', Rule::in(RideOfferDetail::DURATION_FOR)],
            'with_driver' => ['required', 'boolean'],
            'price' => ['required']
        ];
    }
}
