<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'ride_offer_id',
        'booking_status_id',
        'from_location',
        'to_location',
        'from_date_time',
        'to_date_time'
    ];

    public function rideOffer(): BelongsTo
    {
        return $this->belongsTo(RideOffer::class);
    }

    public function bookingStatus(): BelongsTo
    {
        return $this->belongsTo(BookingStatus::class);
    }
}
