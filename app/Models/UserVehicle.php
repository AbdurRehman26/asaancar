<?php

namespace App\Models;

use Database\Factories\UserVehicleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @OA\Schema(
 *     schema="UserVehicle",
 *     title="User Vehicle",
 *     description="Saved vehicle information for a user",
 *
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=12),
 *     @OA\Property(property="vehicle_type", type="string", enum={"car", "bike"}, example="car"),
 *     @OA\Property(property="brand", type="string", nullable=true, example="Toyota"),
 *     @OA\Property(property="model", type="string", nullable=true, example="Corolla"),
 *     @OA\Property(property="color", type="string", nullable=true, example="White"),
 *     @OA\Property(property="seats", type="integer", nullable=true, example=4),
 *     @OA\Property(property="transmission", type="string", nullable=true, enum={"manual", "automatic"}, example="automatic"),
 *     @OA\Property(property="fuel_type", type="string", nullable=true, enum={"petrol", "diesel", "electric", "hybrid"}, example="petrol"),
 *     @OA\Property(property="is_default", type="boolean", example=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class UserVehicle extends Model
{
    /** @use HasFactory<UserVehicleFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'vehicle_type',
        'brand',
        'model',
        'color',
        'seats',
        'transmission',
        'fuel_type',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'seats' => 'integer',
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
