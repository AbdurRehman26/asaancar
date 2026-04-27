<?php

use App\Models\Conversation;
use App\Models\Message;
use App\Models\RideRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;

it('creates a ride request conversation when provided a ride_request type and user_id payload', function () {
    $sender = User::factory()->create();
    $recipient = User::factory()->create();
    $rideRequest = RideRequest::factory()->create([
        'user_id' => $recipient->id,
    ]);

    $response = $this
        ->actingAs($sender)
        ->postJson('/api/chat/conversations', [
            'type' => 'ride_request',
            'user_id' => $recipient->id,
            'ride_request_id' => $rideRequest->id,
        ]);

    $response->assertSuccessful()
        ->assertJsonPath('type', 'ride_request')
        ->assertJsonPath('user_id', $sender->id)
        ->assertJsonPath('recipient_user_id', $recipient->id)
        ->assertJsonPath('ride_request_id', $rideRequest->id);

    $this->assertDatabaseHas('conversations', [
        'type' => 'ride_request',
        'user_id' => $sender->id,
        'recipient_user_id' => $recipient->id,
        'ride_request_id' => $rideRequest->id,
    ]);
});

it('returns unread conversation and message counts for the authenticated user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $thirdUser = User::factory()->create();

    $firstConversation = Conversation::query()->create([
        'type' => 'user',
        'user_id' => $user->id,
        'recipient_user_id' => $otherUser->id,
    ]);

    $secondConversation = Conversation::query()->create([
        'type' => 'user',
        'user_id' => $user->id,
        'recipient_user_id' => $thirdUser->id,
    ]);

    Message::query()->create([
        'conversation_id' => $firstConversation->id,
        'sender_id' => $user->id,
        'message' => 'Sent by me',
        'is_read' => true,
    ]);

    Message::query()->create([
        'conversation_id' => $firstConversation->id,
        'sender_id' => $otherUser->id,
        'message' => 'Unread one',
        'is_read' => false,
    ]);

    Message::query()->create([
        'conversation_id' => $firstConversation->id,
        'sender_id' => $otherUser->id,
        'message' => 'Unread two',
        'is_read' => false,
    ]);

    Message::query()->create([
        'conversation_id' => $secondConversation->id,
        'sender_id' => $user->id,
        'message' => 'Started this one too',
        'is_read' => true,
    ]);

    Message::query()->create([
        'conversation_id' => $secondConversation->id,
        'sender_id' => $thirdUser->id,
        'message' => 'Another unread',
        'is_read' => false,
    ]);

    $response = $this->actingAs($user)->getJson('/api/chat/unread-summary');

    $response->assertSuccessful()
        ->assertJson([
            'unread_conversations' => 2,
            'unread_messages' => 3,
        ]);
});

it('excludes deleted conversations without new messages from unread summary', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $conversation = Conversation::query()->create([
        'type' => 'user',
        'user_id' => $user->id,
        'recipient_user_id' => $otherUser->id,
    ]);

    Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $otherUser->id,
        'message' => 'Unread before deletion',
        'is_read' => false,
        'created_at' => now()->subMinutes(10),
        'updated_at' => now()->subMinutes(10),
    ]);

    DB::table('conversation_user_deletes')->insert([
        'user_id' => $user->id,
        'conversation_id' => $conversation->id,
        'deleted_at' => now()->subMinutes(5),
        'created_at' => now()->subMinutes(5),
        'updated_at' => now()->subMinutes(5),
    ]);

    $response = $this->actingAs($user)->getJson('/api/chat/unread-summary');

    $response->assertSuccessful()
        ->assertJson([
            'unread_conversations' => 0,
            'unread_messages' => 0,
        ]);
});
