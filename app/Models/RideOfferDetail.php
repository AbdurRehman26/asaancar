<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RideOfferDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'ride_offer_id',
        'duration_for',
        'with_driver',
        'price'
    ];

    public const DURATION_HOURLY = 'hourly';
    public const DURATION_DAILY = 'daily';

    public const DURATION_FOR = [
        self::DURATION_DAILY,
        self::DURATION_HOURLY
    ];

    public function rideOffer(): BelongsTo
    {
        return $this->belongsTo(RideOffer::class);
    }
}
