<?php

namespace App\Models;

use Database\Factories\DriverAvailabilityFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DriverAvailability extends Model
{
    /** @use HasFactory<DriverAvailabilityFactory> */
    use HasFactory;

    protected $table = 'driver_availability';

    protected $fillable = [
        'driver_user_id',
        'is_online',
        'is_available',
        'vehicle_type',
        'last_seen_at',
    ];

    protected $casts = [
        'is_online' => 'boolean',
        'is_available' => 'boolean',
        'last_seen_at' => 'datetime',
    ];

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_user_id');
    }

    public function driverLocation(): HasOne
    {
        return $this->hasOne(DriverLocation::class, 'driver_user_id', 'driver_user_id');
    }
}
