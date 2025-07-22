<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = ['name', 'email', 'message', 'store_id', 'car_details'];
    protected $casts = [
        'car_details' => 'array',
    ];
}
