<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\QueryBuilder\AllowedFilter;

class VehicleMake extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'slug',
        'vehicle_type_id'
    ];

    public static function getAllowedFilters(): array
    {
        return [
            AllowedFilter::exact('vehicle_type_id'),
        ];
    }
}
