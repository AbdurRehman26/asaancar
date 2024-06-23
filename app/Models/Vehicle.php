<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\QueryBuilder\AllowedFilter;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_type_id',
        'vehicle_model_id',
        'user_id',
        'color',
        'number_plate',
        'year_of_manufacture'
    ];

    public static function getAllowedFilters(): array
    {
        return [
          AllowedFilter::exact('user_id')
        ];
    }
}
