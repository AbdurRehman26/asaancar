<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedInclude;

class VehicleModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'vehicle_make_id',
        'vehicle_type_id'
    ];

    public static function getAllowedFilters(): array
    {
        return [
            AllowedFilter::exact('vehicle_make_id'),
            AllowedFilter::exact('vehicle_type_id'),
        ];
    }
}
