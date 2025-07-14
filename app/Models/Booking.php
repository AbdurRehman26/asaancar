<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @OA\Schema(
 *     schema="Booking",
 *     title="Booking",
 *     description="Booking model",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="store_id", type="integer", example=1),
 *     @OA\Property(property="car_id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="start_date", type="string", format="date-time", example="2024-01-01T10:00:00Z"),
 *     @OA\Property(property="end_date", type="string", format="date-time", example="2024-01-03T10:00:00Z"),
 *     @OA\Property(property="total_price", type="number", format="float", example=150.00),
 *     @OA\Property(property="status", type="string", example="confirmed"),
 *     @OA\Property(property="notes", type="string", nullable=true, example="Customer requested early pickup"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time"),
 *     @OA\Property(property="car", ref="#/components/schemas/Car"),
 *     @OA\Property(property="user", ref="#/components/schemas/User")
 * )
 */
class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'car_id',
        'user_id',
        'start_date',
        'end_date',
        'total_price',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'total_price' => 'decimal:2',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }
}
