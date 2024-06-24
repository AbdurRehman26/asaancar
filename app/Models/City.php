<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code'
    ];

    public function scopeForKarachi(Builder $builder): Builder
    {
        return $builder->where('code', 'pk_khi');
    }
}
