<?php

namespace App\Models;

use Database\Factories\LiveRideRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LiveRideRequest extends Model
{
    /** @use HasFactory<LiveRideRequestFactory> */
    use HasFactory;

    public const STATUS_SEARCHING = 'searching';

    public const STATUS_DRIVER_ASSIGNED = 'driver_assigned';

    public const STATUS_DRIVER_ARRIVING = 'driver_arriving';

    public const STATUS_RIDER_ONBOARD = 'rider_onboard';

    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_EXPIRED = 'expired';

    /**
     * @var list<string>
     */
    public const ACTIVE_STATUSES = [
        self::STATUS_SEARCHING,
        self::STATUS_DRIVER_ASSIGNED,
        self::STATUS_DRIVER_ARRIVING,
        self::STATUS_RIDER_ONBOARD,
        self::STATUS_IN_PROGRESS,
    ];

    protected $fillable = [
        'rider_user_id',
        'driver_user_id',
        'status',
        'pickup_place_id',
        'pickup_location',
        'pickup_latitude',
        'pickup_longitude',
        'dropoff_place_id',
        'dropoff_location',
        'dropoff_latitude',
        'dropoff_longitude',
        'vehicle_type',
        'estimated_fare',
        'final_fare',
        'distance_km',
        'eta_minutes',
        'currency',
        'requested_at',
        'accepted_at',
        'arrived_at',
        'started_at',
        'completed_at',
        'cancelled_at',
        'cancelled_by',
        'cancellation_reason',
    ];

    protected $casts = [
        'pickup_latitude' => 'decimal:7',
        'pickup_longitude' => 'decimal:7',
        'dropoff_latitude' => 'decimal:7',
        'dropoff_longitude' => 'decimal:7',
        'estimated_fare' => 'decimal:2',
        'final_fare' => 'decimal:2',
        'distance_km' => 'decimal:2',
        'eta_minutes' => 'integer',
        'requested_at' => 'datetime',
        'accepted_at' => 'datetime',
        'arrived_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function rider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rider_user_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_user_id');
    }

    public function latestDriverLocation(): HasOne
    {
        return $this->hasOne(DriverLocation::class, 'driver_user_id', 'driver_user_id');
    }

    public function dispatchEvents(): HasMany
    {
        return $this->hasMany(RideDispatchEvent::class)->orderBy('occurred_at');
    }

    public function rejections(): HasMany
    {
        return $this->hasMany(LiveRideRequestRejection::class);
    }
}
