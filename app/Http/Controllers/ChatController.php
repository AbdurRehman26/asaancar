<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    // List conversations for the authenticated user
    public function conversations(Request $request)
    {
        $user = Auth::user();
        $conversations = $user->conversations()->with(['lastMessage', 'booking', 'store'])->latest('updated_at')->get();
        // Add unread count for each conversation
        $conversations->transform(function ($conv) use ($user) {
            $conv->unread_count = $conv->messages()->where('is_read', false)->where('sender_id', '!=', $user->id)->count();
            return $conv;
        });
        return response()->json($conversations);
    }

    // List messages for a conversation
    public function messages(Conversation $conversation)
    {
        $user = Auth::user();
        // Mark all unread messages as read for this user
        $conversation->messages()->where('is_read', false)->where('sender_id', '!=', $user->id)->update(['is_read' => true]);
        $messages = $conversation->messages()->with('sender')->orderBy('created_at')->get();
        return response()->json($messages);
    }

    // Send a message in a conversation
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);
        $message = $conversation->messages()->create([
            'sender_id' => Auth::id(),
            'message' => $request->message,
        ]);
        broadcast(new MessageSent($message))->toOthers();
        return response()->json($message->load('sender'));
    }

    // Create a conversation for a booking or store if it doesn't exist
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:booking,store',
            'booking_id' => 'required_if:type,booking|nullable|integer',
            'store_id' => 'required_if:type,store|nullable|integer',
        ]);

        $query = [
            'user_id' => auth()->user()->id,
            'type' => $request->type,
            'booking_id' => $request->type === 'booking' ? $request->booking_id : null,
            'store_id' => $request->type === 'store' ? $request->store_id : null,
        ];

        $conversation = \App\Models\Conversation::firstOrCreate($query);

        return response()->json($conversation);
    }
}
