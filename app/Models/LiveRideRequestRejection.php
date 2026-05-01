<?php

namespace App\Models;

use Database\Factories\LiveRideRequestRejectionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveRideRequestRejection extends Model
{
    /** @use HasFactory<LiveRideRequestRejectionFactory> */
    use HasFactory;

    protected $fillable = [
        'live_ride_request_id',
        'driver_user_id',
        'rejected_at',
    ];

    protected $casts = [
        'rejected_at' => 'datetime',
    ];

    public function liveRideRequest(): BelongsTo
    {
        return $this->belongsTo(LiveRideRequest::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_user_id');
    }
}
