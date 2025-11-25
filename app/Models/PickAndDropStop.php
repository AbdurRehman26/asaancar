<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PickAndDropStop extends Model
{
    use HasFactory;

    protected $fillable = [
        'pick_and_drop_service_id',
        'location',
        'city_id',
        'area_id',
        'stop_time',
        'order',
        'notes',
    ];

    protected $casts = [
        'stop_time' => 'datetime',
        'order' => 'integer',
    ];

    public function pickAndDropService(): BelongsTo
    {
        return $this->belongsTo(PickAndDrop::class, 'pick_and_drop_service_id', 'id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }
}
