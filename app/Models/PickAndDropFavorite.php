<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PickAndDropFavorite extends Model
{
    /** @use HasFactory<\Database\Factories\PickAndDropFavoriteFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'pick_and_drop_service_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pickAndDropService()
    {
        return $this->belongsTo(PickAndDrop::class, 'pick_and_drop_service_id');
    }
}
