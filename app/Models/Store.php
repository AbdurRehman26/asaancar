<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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