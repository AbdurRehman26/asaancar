<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PickAndDrop extends Model
{
    use HasFactory;

    protected $table = 'pick_and_drop_services';

    protected $fillable = [
        'user_id',
        'car_id',
        'start_location',
        'end_location',
        'pickup_city_id',
        'dropoff_city_id',
        'pickup_area_id',
        'dropoff_area_id',
        'available_spaces',
        'driver_gender',
        'car_brand',
        'car_model',
        'car_color',
        'car_seats',
        'car_transmission',
        'car_fuel_type',
        'departure_time',
        'description',
        'price_per_person',
        'currency',
        'is_active',
        'is_everyday',
    ];

    protected $casts = [
        'departure_time' => 'datetime',
        'price_per_person' => 'decimal:2',
        'is_active' => 'boolean',
        'is_everyday' => 'boolean',
        'available_spaces' => 'integer',
        'car_seats' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    public function stops(): HasMany
    {
        return $this->hasMany(PickAndDropStop::class, 'pick_and_drop_service_id', 'id')->orderBy('order');
    }

    public function pickupCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'pickup_city_id');
    }

    public function dropoffCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'dropoff_city_id');
    }

    public function pickupArea(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'pickup_area_id');
    }

    public function dropoffArea(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'dropoff_area_id');
    }
}
