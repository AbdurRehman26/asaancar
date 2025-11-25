<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'type', 'booking_id', 'store_id', 'user_id', 'recipient_user_id', 'pick_and_drop_service_id',
    ];

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'messages', 'conversation_id', 'sender_id')->distinct();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function recipientUser()
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    public function pickAndDropService()
    {
        return $this->belongsTo(PickAndDrop::class, 'pick_and_drop_service_id');
    }

    public function lastMessage(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Message::class)->orderBy('created_at', 'desc');
    }
}
