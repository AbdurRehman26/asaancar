<?php

namespace App\Http\Requests\V1\Booking;

use Illuminate\Foundation\Http\FormRequest;

class BookingStoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'ride_offer_id' => ['required', 'exists:ride_offers,id'],
            'booking_status_id' => ['required', 'exists:booking_statuses,id'],
            'from_location' => ['required', 'string'],
            'to_location' => ['sometimes', 'string'],
            'from_date_time' => ['required', 'date_format:Y-m-d H:i'],
            'to_date_time' => ['required', 'date_format:Y-m-d H:i', 'after:from_date_time'],
        ];
    }
}
