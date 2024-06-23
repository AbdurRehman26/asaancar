<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Builder;

class Document extends Model
{
    use HasFactory;

    public const PASSPORT = 'passport';
    public const NIC = 'nic';
    public const DRIVER_LICENSE = 'driver_license';

    public const USER_DOCUMENT_TYPES = [
        self::NIC,
        self::DRIVER_LICENSE,
        self::PASSPORT
    ];

    public const DOCUMENTABLE_TYPES = [
      'user' => User::class,
      'vehicle' => Vehicle::class
    ];

    protected $fillable = [
        'documentable_id',
        'documentable_type',
        'document_type',
        'document_url',
        'is_verified'
    ];

    public function documentable(): morphTo
    {
        return $this->morphTo();
    }

    public function scopeForUserItems(Builder $builder)
    {
        return $builder->where(function($query){
                $query->where('documentable_type', self::DOCUMENTABLE_TYPES['user'])
                    ->where('documentable_id', auth()->user()->id);
            });
    }
}
