<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Area extends Model
{
    use HasFactory;

    protected $fillable = [
        'city_id',
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function pickupServices(): HasMany
    {
        return $this->hasMany(PickAndDrop::class, 'pickup_area_id');
    }

    public function dropoffServices(): HasMany
    {
        return $this->hasMany(PickAndDrop::class, 'dropoff_area_id');
    }
}
