<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Notifications\MessageReceivedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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
     *
     *     @OA\Parameter(name="type", in="query", description="Filter by conversation type (user, pick_and_drop)", required=false, @OA\Schema(type="string")),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     * List conversations for the authenticated user
     */
    public function conversations(Request $request)
    {
        $user = Auth::user();
        $type = $request->get('type');

        $query = $user->conversations()->with(['lastMessage', 'recipientUser', 'pickAndDropService']);

        // Filter by type if provided
        if ($type) {
            $query->where('type', $type);
        }

        // Exclude conversations that the user has deleted, but only if there are no new messages after deletion
        $deletedConversations = DB::table('conversation_user_deletes')
            ->where('user_id', $user->id)
            ->get()
            ->keyBy('conversation_id');

        if ($deletedConversations->isNotEmpty()) {
            $conversationIds = $deletedConversations->keys()->toArray();

            // For each deleted conversation, check if there are messages after deletion
            $conversationsWithNewMessages = [];
            foreach ($deletedConversations as $conversationId => $deleteRecord) {
                $hasNewMessages = DB::table('messages')
                    ->where('conversation_id', $conversationId)
                    ->where('created_at', '>', $deleteRecord->deleted_at)
                    ->exists();

                if ($hasNewMessages) {
                    $conversationsWithNewMessages[] = $conversationId;
                }
            }

            // Exclude deleted conversations that don't have new messages
            $conversationsToExclude = array_diff($conversationIds, $conversationsWithNewMessages);

            if (! empty($conversationsToExclude)) {
                $query->whereNotIn('conversations.id', $conversationsToExclude);
            }
        }

        $conversations = $query->latest('updated_at')->get();

        // Add unread count for each conversation
        $conversations->transform(function ($conv) use ($user) {
            $conv->unread_count = $conv->messages()->where('is_read', false)->where('sender_id', '!=', $user->id)->count();

            return $conv;
        });

        return response()->json(ConversationResource::collection($conversations));
    }

    /**
     * @OA\Get(
     *     path="/api/chat/conversations/{conversation}/messages",
     *     operationId="getMessages",
     *     tags={"Chat"},
     *     summary="Get conversation messages",
     *     description="Get all messages for a conversation and mark them as read",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Parameter(name="conversation", in="path", required=true, description="Conversation ID", @OA\Schema(type="integer")),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     * List messages for a conversation
     */
    public function messages(Conversation $conversation)
    {
        $user = Auth::user();

        // Check if user has deleted this conversation and get the deletion timestamp
        $deletedAt = DB::table('conversation_user_deletes')
            ->where('user_id', $user->id)
            ->where('conversation_id', $conversation->id)
            ->value('deleted_at');

        // Mark all unread messages as read for this user
        $conversation->messages()->where('is_read', false)->where('sender_id', '!=', $user->id)->update(['is_read' => true]);

        // Get messages, but exclude messages that were sent before the user deleted the conversation
        $messagesQuery = $conversation->messages()->with('sender')->orderBy('created_at');

        if ($deletedAt) {
            // Only show messages sent after the user deleted the conversation
            $messagesQuery->where('created_at', '>', $deletedAt);
        }

        $messages = $messagesQuery->get();

        return response()->json(MessageResource::collection($messages));
    }

    /**
     * @OA\Post(
     *     path="/api/chat/conversations/{conversation}/messages",
     *     operationId="sendMessage",
     *     tags={"Chat"},
     *     summary="Send message",
     *     description="Send a message in a conversation",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Parameter(name="conversation", in="path", required=true, description="Conversation ID", @OA\Schema(type="integer")),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"message"},
     *
     *             @OA\Property(property="message", type="string", example="Hello, I'm interested in this car", maxLength=2000)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Message sent successfully",
     *
     *         @OA\JsonContent(type="object")
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error")
     * )
     * Send a message in a conversation
     */
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $user = Auth::user();

        // If user had previously deleted this conversation, update the deletion timestamp
        // This restores the conversation in their list but keeps old messages hidden
        $deletedRecord = DB::table('conversation_user_deletes')
            ->where('user_id', $user->id)
            ->where('conversation_id', $conversation->id)
            ->first();

        if ($deletedRecord) {
            // Update deletion timestamp to now, so only messages from now onwards are visible
            DB::table('conversation_user_deletes')
                ->where('user_id', $user->id)
                ->where('conversation_id', $conversation->id)
                ->update(['deleted_at' => now()]);
        }

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'message' => $request->message,
        ]);

        // Load sender relationship
        $message->load('sender');

        // Notify the recipient(s) about the new message
        $conversation->load(['user', 'recipientUser']);

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
        } elseif ($conversation->type === 'pick_and_drop' && $conversation->pickAndDropService) {
            // Pick and drop conversation - notify service owner and recipient user
            if ($conversation->pickAndDropService->user_id !== Auth::id() && $conversation->pickAndDropService->user) {
                $recipients[] = $conversation->pickAndDropService->user;
            }
            if ($conversation->recipient_user_id && $conversation->recipient_user_id !== Auth::id() && $conversation->recipientUser) {
                $recipients[] = $conversation->recipientUser;
            }
        }

        // Send notifications to unique recipients
        $notifiedUserIds = [];
        foreach ($recipients as $recipient) {
            if (! in_array($recipient->id, $notifiedUserIds)) {
                $recipient->notify(new MessageReceivedNotification($message, $conversation));
                $notifiedUserIds[] = $recipient->id;
            }
        }

        broadcast(new MessageSent($message))->toOthers();

        return response()->json(new MessageResource($message->load('sender')));
    }

    /**
     * @OA\Post(
     *     path="/api/chat/conversations",
     *     operationId="createConversation",
     *     tags={"Chat"},
     *     summary="Create conversation",
     *     description="Create a new conversation for a booking, store, user, or pick and drop service",
     *     security={{"sanctum": {}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"type"},
     *
     *             @OA\Property(property="type", type="string", enum={"user", "pick_and_drop"}, example="user"),
     *             @OA\Property(property="recipient_user_id", type="integer", example=2, nullable=true, description="Required if type is user"),
     *             @OA\Property(property="pick_and_drop_service_id", type="integer", example=1, nullable=true, description="Required if type is pick_and_drop")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Conversation created or retrieved successfully",
     *
     *         @OA\JsonContent(type="object")
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error")
     * )
     * Create a conversation for a booking, store, or user if it doesn't exist
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:user,pick_and_drop',
            'recipient_user_id' => 'required_if:type,user|nullable|integer|exists:users,id',
            'pick_and_drop_service_id' => 'required_if:type,pick_and_drop|nullable|integer|exists:pick_and_drop_services,id',
        ]);

        $user = auth()->user();

        $query = [
            'user_id' => $user->id,
            'type' => $request->type,
            'recipient_user_id' => $request->type === 'user' ? $request->recipient_user_id : null,
            'pick_and_drop_service_id' => $request->type === 'pick_and_drop' ? $request->pick_and_drop_service_id : null,
        ];

        $conversation = \App\Models\Conversation::firstOrCreate($query);

        // If user had previously deleted this conversation, update the deletion timestamp
        // This restores the conversation in their list but keeps old messages hidden
        $deletedRecord = DB::table('conversation_user_deletes')
            ->where('user_id', $user->id)
            ->where('conversation_id', $conversation->id)
            ->first();

        if ($deletedRecord) {
            // Update deletion timestamp to now, so only messages from now onwards are visible
            DB::table('conversation_user_deletes')
                ->where('user_id', $user->id)
                ->where('conversation_id', $conversation->id)
                ->update(['deleted_at' => now()]);
        }

        return response()->json($conversation);
    }

    /**
     * @OA\Delete(
     *     path="/api/chat/conversations/{conversation}",
     *     operationId="deleteConversation",
     *     tags={"Chat"},
     *     summary="Delete conversation",
     *     description="Delete a conversation for the current user only (soft delete). The conversation will remain visible to other participants. If the user sends a new message, the conversation will be restored but old messages will remain hidden.",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Parameter(name="conversation", in="path", required=true, description="Conversation ID", @OA\Schema(type="integer")),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Conversation deleted successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Conversation deleted successfully")
     *         )
     *     ),
     *
     *     @OA\Response(response=403, description="Unauthorized to delete this conversation"),
     *     @OA\Response(response=404, description="Conversation not found")
     * )
     * Delete a conversation (soft delete per user)
     */
    public function destroy(Conversation $conversation)
    {
        $user = Auth::user();

        // Check if user is authorized to delete this conversation
        // User can delete if:
        // 1. They are the conversation owner (user_id)
        // 2. They are the recipient (recipient_user_id) for user/pick_and_drop conversations
        // 3. They are a participant (have sent messages in this conversation)
        $isOwner = $conversation->user_id === $user->id;
        $isRecipient = $conversation->recipient_user_id === $user->id;
        $isParticipant = $conversation->messages()->where('sender_id', $user->id)->exists();

        if (! $isOwner && ! $isRecipient && ! $isParticipant) {
            return response()->json([
                'message' => 'Unauthorized to delete this conversation',
            ], 403);
        }

        // Soft delete: Mark conversation as deleted for this user only
        // Use updateOrInsert to handle the case where the record might already exist
        DB::table('conversation_user_deletes')->updateOrInsert(
            [
                'user_id' => $user->id,
                'conversation_id' => $conversation->id,
            ],
            [
                'deleted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Conversation deleted successfully',
        ], 200);
    }
}
