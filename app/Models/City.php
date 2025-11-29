<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @OA\Schema(
 *     schema="City",
 *     title="City",
 *     description="City model",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Karachi"),
 *     @OA\Property(property="slug", type="string", example="karachi"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function areas(): HasMany
    {
        return $this->hasMany(Area::class);
    }

    public function pickupServices(): HasMany
    {
        return $this->hasMany(PickAndDrop::class, 'pickup_city_id');
    }

    public function dropoffServices(): HasMany
    {
        return $this->hasMany(PickAndDrop::class, 'dropoff_city_id');
    }
} 