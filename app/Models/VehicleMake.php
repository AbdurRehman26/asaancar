<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleMake extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'slug',
        'vehicle_type_id'
    ];

    public function scopeVehicleType(Builder $builder, VehicleType $vehicleType): Builder
    {
        return $builder->where('vehicle_type_id', $vehicleType->id);
    }
}
