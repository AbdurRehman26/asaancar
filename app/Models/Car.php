<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @OA\Schema(
 *     schema="Car",
 *     title="Car",
 *     description="Car model",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="car_brand_id", type="integer", example=1),
 *     @OA\Property(property="car_type_id", type="integer", example=1),
 *     @OA\Property(property="car_engine_id", type="integer", example=1),
 *     @OA\Property(property="store_id", type="integer", example=1),
 *     @OA\Property(property="model", type="string", example="Civic"),
 *     @OA\Property(property="year", type="integer", example=2020),
 *     @OA\Property(property="color", type="string", example="blue"),
 *     @OA\Property(property="seats", type="integer", example=5),
 *     @OA\Property(property="transmission", type="string", example="automatic"),
 *     @OA\Property(property="fuel_type", type="string", example="petrol"),
 *     @OA\Property(property="description", type="string", example="A reliable car for daily use"),
 *     @OA\Property(property="image_urls", type="array", @OA\Items(type="string")),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time"),
 *     @OA\Property(property="car_brand", ref="#/components/schemas/CarBrand"),
 *     @OA\Property(property="car_type", ref="#/components/schemas/CarType"),
 *     @OA\Property(property="car_engine", ref="#/components/schemas/CarEngine"),
 *     @OA\Property(property="store", ref="#/components/schemas/Store")
 * )
 */
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
