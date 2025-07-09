<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @OA\Schema(
 *     schema="Store",
 *     title="Store",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Downtown Car Rental"),
 *     @OA\Property(property="store_username", type="string", example="downtown_rental"),
 *     @OA\Property(property="description", type="string", example="Premium car rental service"),
 *     @OA\Property(property="address", type="string", example="123 Main St"),
 *     @OA\Property(property="phone", type="string", example="+1234567890"),
 *     @OA\Property(property="email", type="string", example="info@downtown.com"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class Store extends Model
{
    protected $fillable = [
        'store_username',
        'name',
        'description',
        'logo_url',
        'city',
        'contact_phone',
        'address',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function cars(): HasMany
    {
        return $this->hasMany(Car::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function carOffers(): HasMany
    {
        return $this->hasMany(CarOffer::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }
} 