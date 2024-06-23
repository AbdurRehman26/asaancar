<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleType extends Model
{
    use HasFactory;

    const TYPE_CAR = 1;


    protected $fillable = [
        'name',
        'code',
        'is_enabled'
    ];
}
