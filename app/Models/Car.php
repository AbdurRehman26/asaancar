<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Car extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'car_brand_id',
        'car_type_id',
        'car_engine_id',
        'model',
        'year',
        'name',
        'color',
        'description',
        'image_urls',
        'seats',
        'transmission',
        'fuel_type',
    ];

    protected $casts = [
        'image_urls' => 'array',
        'seats' => 'integer',
        'year' => 'integer',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
    public function carBrand(): BelongsTo
    {
        return $this->belongsTo(CarBrand::class);
    }
    public function carType(): BelongsTo
    {
        return $this->belongsTo(CarType::class);
    }
    public function carEngine(): BelongsTo
    {
        return $this->belongsTo(CarEngine::class);
    }
}
