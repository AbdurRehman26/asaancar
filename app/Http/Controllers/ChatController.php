<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Notifications\MessageReceivedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Tag(
 *     name="Chat",
 *     description="API Endpoints for chat and messaging"
 * )
 */
class ChatController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/chat/conversations",
     *     operationId="getConversations",
     *     tags={"Chat"},
     *     summary="List conversations",
     *     description="Get a list of conversations for the authenticated user",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="store_id", in="query", description="Filter by store ID", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="type", in="query", description="Filter by conversation type (rental, booking, store, pick_and_drop)", required=false, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     * List conversations for the authenticated user
     */
    public function conversations(Request $request)
    {
        $user = Auth::user();
        $storeId = $request->get('store_id');
        $type = $request->get('type'); // Filter by conversation type
        
        $query = $user->conversations()->with(['lastMessage', 'booking', 'store', 'recipientUser', 'pickAndDropService']);
        
        // Filter by store if provided
        if ($storeId) {
            $query->where('store_id', $storeId);
        }
        
        // Filter by type if provided
        if ($type) {
            if ($type === 'rental') {
                // Rental includes booking and store types
                $query->whereIn('type', ['booking', 'store']);
            } else {
                // Specific type (e.g., 'pick_and_drop', 'booking', 'store')
                $query->where('type', $type);
            }
        }
        
        $conversations = $query->latest('updated_at')->get();
        
        // Add unread count for each conversation
        $conversations->transform(function ($conv) use ($user) {
            $conv->unread_count = $conv->messages()->where('is_read', false)->where('sender_id', '!=', $user->id)->count();
            return $conv;
        });
        return response()->json($conversations);
    }

    /**
     * @OA\Get(
     *     path="/api/chat/conversations/{conversation}/messages",
     *     operationId="getMessages",
     *     tags={"Chat"},
     *     summary="Get conversation messages",
     *     description="Get all messages for a conversation and mark them as read",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="conversation", in="path", required=true, description="Conversation ID", @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     * List messages for a conversation
     */
    public function messages(Conversation $conversation)
    {
        $user = Auth::user();
        // Mark all unread messages as read for this user
        $conversation->messages()->where('is_read', false)->where('sender_id', '!=', $user->id)->update(['is_read' => true]);
        $messages = $conversation->messages()->with('sender')->orderBy('created_at')->get();
        return response()->json($messages);
    }

    /**
     * @OA\Post(
     *     path="/api/chat/conversations/{conversation}/messages",
     *     operationId="sendMessage",
     *     tags={"Chat"},
     *     summary="Send message",
     *     description="Send a message in a conversation",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="conversation", in="path", required=true, description="Conversation ID", @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"message"},
     *             @OA\Property(property="message", type="string", example="Hello, I'm interested in this car", maxLength=2000)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Message sent successfully",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     * Send a message in a conversation
     */
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);
        $message = $conversation->messages()->create([
            'sender_id' => Auth::id(),
            'message' => $request->message,
        ]);
        
        // Load sender relationship
        $message->load('sender');
        
        // Notify the recipient(s) about the new message
        $conversation->load(['user', 'store', 'recipientUser']);
        
        // Determine who should be notified
        $recipients = [];
        
        if ($conversation->type === 'user' && $conversation->recipientUser) {
            // Direct user-to-user conversation
            if ($conversation->recipientUser->id !== Auth::id()) {
                $recipients[] = $conversation->recipientUser;
            }
            if ($conversation->user_id !== Auth::id() && $conversation->user) {
                $recipients[] = $conversation->user;
            }
        } elseif ($conversation->type === 'store' && $conversation->store) {
            // Store conversation - notify all store users except sender
            $storeUsers = $conversation->store->users()->where('users.id', '!=', Auth::id())->get();
            $recipients = $storeUsers->all();
        } elseif ($conversation->type === 'booking' && $conversation->booking) {
            // Booking conversation - notify booking owner and store users
            if ($conversation->booking->user_id !== Auth::id() && $conversation->booking->user) {
                $recipients[] = $conversation->booking->user;
            }
            if ($conversation->booking->store) {
                $storeUsers = $conversation->booking->store->users()->where('users.id', '!=', Auth::id())->get();
                $recipients = array_merge($recipients, $storeUsers->all());
            }
        } elseif ($conversation->type === 'pick_and_drop' && $conversation->pickAndDropService) {
            // Pick and drop conversation
            if ($conversation->pickAndDropService->user_id !== Auth::id() && $conversation->pickAndDropService->user) {
                $recipients[] = $conversation->pickAndDropService->user;
            }
        }
        
        // Send notifications to unique recipients
        $notifiedUserIds = [];
        foreach ($recipients as $recipient) {
            if (!in_array($recipient->id, $notifiedUserIds)) {
                $recipient->notify(new MessageReceivedNotification($message, $conversation));
                $notifiedUserIds[] = $recipient->id;
            }
        }
        
        broadcast(new MessageSent($message))->toOthers();
        return response()->json($message->load('sender'));
    }

    /**
     * @OA\Post(
     *     path="/api/chat/conversations",
     *     operationId="createConversation",
     *     tags={"Chat"},
     *     summary="Create conversation",
     *     description="Create a new conversation for a booking, store, user, or pick and drop service",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"type"},
     *             @OA\Property(property="type", type="string", enum={"booking", "store", "user", "pick_and_drop"}, example="booking"),
     *             @OA\Property(property="booking_id", type="integer", example=1, nullable=true, description="Required if type is booking"),
     *             @OA\Property(property="store_id", type="integer", example=1, nullable=true, description="Required if type is store"),
     *             @OA\Property(property="recipient_user_id", type="integer", example=2, nullable=true, description="Required if type is user"),
     *             @OA\Property(property="pick_and_drop_service_id", type="integer", example=1, nullable=true, description="Required if type is pick_and_drop")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Conversation created or retrieved successfully",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     * Create a conversation for a booking, store, or user if it doesn't exist
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:booking,store,user,pick_and_drop',
            'booking_id' => 'required_if:type,booking|nullable|integer',
            'store_id' => 'required_if:type,store|nullable|integer',
            'recipient_user_id' => 'required_if:type,user|nullable|integer|exists:users,id',
            'pick_and_drop_service_id' => 'required_if:type,pick_and_drop|nullable|integer|exists:pick_and_drop_services,id',
        ]);

        $query = [
            'user_id' => auth()->user()->id,
            'type' => $request->type,
            'booking_id' => $request->type === 'booking' ? $request->booking_id : null,
            'store_id' => $request->type === 'store' ? $request->store_id : null,
            'recipient_user_id' => $request->type === 'user' ? $request->recipient_user_id : null,
            'pick_and_drop_service_id' => $request->type === 'pick_and_drop' ? $request->pick_and_drop_service_id : null,
        ];

        $conversation = \App\Models\Conversation::firstOrCreate($query);

        return response()->json($conversation);
    }
}
