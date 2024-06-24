<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingStatus extends Model
{
    use HasFactory;

    public const REQUESTED = 'requested';
    public const ACCEPTED = 'accepted';
    public const DECLINED = 'declined';
    public const CANCELLED = 'cancelled';
    public const ARCHIVED = 'archived';

    public const STATUSES = [
        self::REQUESTED,
        self::ACCEPTED,
        self::DECLINED,
        self::CANCELLED,
        self::ARCHIVED
    ];

    protected $fillable = [
        'code',
        'name'
    ];

    public function scopeForStatus(Builder $builder, string $code): Builder
    {
        return $builder->where('code', $code);
    }
}
