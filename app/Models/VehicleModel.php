<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'vehicle_make_id',
        'vehicle_type_id'
    ];

    public function scopeVehicleMake(Builder $builder, VehicleMake $vehicleMake): Builder
    {
        return $builder->where('vehicle_make_id', $vehicleMake->id);
    }

}
