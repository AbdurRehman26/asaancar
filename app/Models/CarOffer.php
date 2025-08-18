<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @OA\Schema(
 *     schema="CarOffer",
 *     title="Car Offer",
 *     description="Car offer model",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="car_id", type="integer", example=1),
 *     @OA\Property(property="discount_percentage", type="number", format="float", example=20.00),
 *     @OA\Property(property="currency", type="string", example="PKR", description="Currency code (3 characters)"),
 *     @OA\Property(property="start_date", type="string", format="date-time", example="2024-06-01T00:00:00Z"),
 *     @OA\Property(property="end_date", type="string", format="date-time", example="2024-08-31T23:59:59Z"),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time"),
 *     @OA\Property(property="car", ref="#/components/schemas/Car")
 * )
 */
class CarOffer extends Model
{
    use HasFactory;

    protected $fillable = [
        'car_id',
        'price_without_driver',
        'price_with_driver',
        'discount_percentage',
        'currency',
        'start_date',
        'end_date',
        'available_from',
        'available_to',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'discount_percentage' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }
}
