<?php

namespace App\Models;

use Database\Factories\RideDispatchEventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RideDispatchEvent extends Model
{
    /** @use HasFactory<RideDispatchEventFactory> */
    use HasFactory;

    protected $fillable = [
        'live_ride_request_id',
        'event_type',
        'actor_user_id',
        'payload',
        'occurred_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function liveRideRequest(): BelongsTo
    {
        return $this->belongsTo(LiveRideRequest::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
