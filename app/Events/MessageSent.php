<?php

namespace App\Events;

use App\Http\Resources\MessageResource;
use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message->load('sender');
    }

    public function broadcastOn()
    {
        return new PrivateChannel('conversation.' . $this->message->conversation_id);
    }

    public function broadcastWith()
    {
        $messageResource = new MessageResource($this->message);
        $data = $messageResource->toArray(request());
        
        return [
            'id' => $data['id'],
            'conversation_id' => $data['conversation_id'],
            'sender_id' => $data['sender_id'],
            'sender' => $data['sender'] ?? null,
            'message' => $data['message'],
            'is_read' => $data['is_read'],
            'created_at' => $data['created_at'],
            'updated_at' => $data['updated_at'],
            'formatted_time' => $data['formatted_time'],
        ];
    }
}
