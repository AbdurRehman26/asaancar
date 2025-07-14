<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'type', 'booking_id', 'store_id',
    ];

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'messages', 'conversation_id', 'sender_id')->distinct();
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
} 