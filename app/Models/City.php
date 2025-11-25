<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

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