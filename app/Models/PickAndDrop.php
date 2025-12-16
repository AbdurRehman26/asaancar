<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @OA\Schema(
 *     schema="PickAndDrop",
 *     title="Pick and Drop Service",
 *     description="Pick and drop service model",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="car_id", type="integer", nullable=true, example=1),
 *     @OA\Property(property="start_location", type="string", example="Karachi Airport"),
 *     @OA\Property(property="end_location", type="string", example="Clifton Beach"),
 *     @OA\Property(property="pickup_city_id", type="integer", example=1),
 *     @OA\Property(property="dropoff_city_id", type="integer", example=1),
 *     @OA\Property(property="pickup_area_id", type="integer", example=1),
 *     @OA\Property(property="dropoff_area_id", type="integer", example=2),
 *     @OA\Property(property="available_spaces", type="integer", example=4),
 *     @OA\Property(property="driver_gender", type="string", enum={"male", "female"}, example="male"),
 *     @OA\Property(property="car_brand", type="string", nullable=true, example="Toyota"),
 *     @OA\Property(property="car_model", type="string", nullable=true, example="Corolla"),
 *     @OA\Property(property="car_color", type="string", nullable=true, example="White"),
 *     @OA\Property(property="car_seats", type="integer", nullable=true, example=5),
 *     @OA\Property(property="car_transmission", type="string", nullable=true, example="automatic"),
 *     @OA\Property(property="car_fuel_type", type="string", nullable=true, example="petrol"),
 *     @OA\Property(property="departure_time", type="string", format="date-time", example="2024-01-15T10:00:00Z"),
 *     @OA\Property(property="description", type="string", nullable=true, example="Comfortable ride with AC"),
 *     @OA\Property(property="price_per_person", type="number", format="float", example=500.00),
 *     @OA\Property(property="currency", type="string", example="PKR"),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="is_everyday", type="boolean", example=false),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time"),
 *     @OA\Property(property="user", type="object", nullable=true),
 *     @OA\Property(property="car", type="object", nullable=true),
 *     @OA\Property(property="stops", type="array", @OA\Items(type="object"), nullable=true)
 * )
 */
class PickAndDrop extends Model
{
    use HasFactory;

    protected $table = 'pick_and_drop_services';

    protected $fillable = [
        'user_id',
        'name',
        'contact',
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
        'is_roundtrip',
        'return_time',
        'schedule_type',
        'selected_days',
    ];

    protected $casts = [
        'departure_time' => 'datetime',
        'price_per_person' => 'decimal:2',
        'is_active' => 'boolean',
        'is_everyday' => 'boolean',
        'is_roundtrip' => 'boolean',
        'selected_days' => 'array',
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
