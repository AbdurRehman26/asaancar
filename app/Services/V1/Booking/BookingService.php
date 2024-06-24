<?php

namespace App\Services\V1\Booking;

use App\Models\Booking;

class BookingService
{
    public function store(array $data): Booking
    {
        return Booking::create(
            $data
        );
    }
}
