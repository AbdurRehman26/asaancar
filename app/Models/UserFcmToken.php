<?php

namespace App\Models;

use Database\Factories\UserFcmTokenFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserFcmToken extends Model
{
    /** @use HasFactory<UserFcmTokenFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'token',
        'device_name',
        'platform',
        'app_version',
        'last_used_at',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'last_used_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
