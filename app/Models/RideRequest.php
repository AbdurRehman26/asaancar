<?php

namespace App\Models;

use Database\Factories\RideRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @OA\Schema(
 *     schema="RideRequest",
 *     title="Ride Request",
 *     description="Ride request model",
 *
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", nullable=true, example="Sarah Ahmed"),
 *     @OA\Property(property="contact", type="string", nullable=true, example="+923001112233"),
 *     @OA\Property(property="start_location", type="string", example="Lahore, Pakistan"),
 *     @OA\Property(property="start_place_id", type="string", nullable=true, example="ChIJ2QeB5YMEGTkRYiR-zGy-OsI"),
 *     @OA\Property(property="start_latitude", type="number", format="float", nullable=true, example=31.5204),
 *     @OA\Property(property="start_longitude", type="number", format="float", nullable=true, example=74.3587),
 *     @OA\Property(property="end_location", type="string", example="Karachi, Pakistan"),
 *     @OA\Property(property="end_place_id", type="string", nullable=true, example="ChIJv8nA2Y4-sz4R77g5SRY5uW0"),
 *     @OA\Property(property="end_latitude", type="number", format="float", nullable=true, example=24.8607),
 *     @OA\Property(property="end_longitude", type="number", format="float", nullable=true, example=67.0011),
 *     @OA\Property(property="departure_time", type="string", format="date-time", example="2026-04-25T08:30:00Z"),
 *     @OA\Property(property="schedule_type", type="string", enum={"once", "everyday", "weekdays", "weekends", "custom"}, example="once"),
 *     @OA\Property(property="selected_days", type="array", @OA\Items(type="string"), nullable=true, example={"Monday", "Wednesday"}),
 *     @OA\Property(property="is_roundtrip", type="boolean", example=false),
 *     @OA\Property(property="return_time", type="string", format="time", nullable=true, example="18:00"),
 *     @OA\Property(property="required_seats", type="integer", example=2),
 *     @OA\Property(property="preferred_driver_gender", type="string", enum={"male", "female", "any"}, example="female"),
 *     @OA\Property(property="budget_per_seat", type="integer", nullable=true, example=1200),
 *     @OA\Property(property="currency", type="string", example="PKR"),
 *     @OA\Property(property="description", type="string", nullable=true, example="Need a comfortable morning ride."),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="is_system_generated", type="boolean", example=false),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time"),
 *     @OA\Property(property="user", type="object", nullable=true)
 * )
 */
class RideRequest extends Model
{
    /** @use HasFactory<RideRequestFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'contact',
        'start_location',
        'start_place_id',
        'start_latitude',
        'start_longitude',
        'end_location',
        'end_place_id',
        'end_latitude',
        'end_longitude',
        'departure_time',
        'schedule_type',
        'selected_days',
        'is_roundtrip',
        'return_time',
        'required_seats',
        'preferred_driver_gender',
        'budget_per_seat',
        'currency',
        'description',
        'is_active',
        'is_system_generated',
    ];

    protected $casts = [
        'departure_time' => 'datetime',
        'selected_days' => 'array',
        'is_roundtrip' => 'boolean',
        'required_seats' => 'integer',
        'budget_per_seat' => 'integer',
        'is_active' => 'boolean',
        'is_system_generated' => 'boolean',
        'start_latitude' => 'decimal:8',
        'start_longitude' => 'decimal:8',
        'end_latitude' => 'decimal:8',
        'end_longitude' => 'decimal:8',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
