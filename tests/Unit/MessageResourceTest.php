<?php

use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

it('formats yesterday messages using a calendar label instead of relative hours', function () {
    Carbon::setTestNow(Carbon::parse('2026-04-28 00:10:00'));

    $sender = User::factory()->create();
    $conversation = Conversation::query()->create([
        'type' => 'user',
        'user_id' => $sender->id,
        'recipient_user_id' => User::factory()->create()->id,
    ]);

    $message = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $sender->id,
        'message' => 'Test message',
        'is_read' => false,
    ]);

    $message->forceFill([
        'created_at' => Carbon::parse('2026-04-27 23:50:00'),
        'updated_at' => Carbon::parse('2026-04-27 23:50:00'),
    ])->save();

    $resource = (new MessageResource($message))->toArray(request());

    expect($resource['formatted_time'])->toBe('yesterday at 11:50 PM');

    Carbon::setTestNow();
});

it('formats same-day messages as relative hours', function () {
    Carbon::setTestNow(Carbon::parse('2026-04-28 12:00:00'));

    $sender = User::factory()->create();
    $conversation = Conversation::query()->create([
        'type' => 'user',
        'user_id' => $sender->id,
        'recipient_user_id' => User::factory()->create()->id,
    ]);

    $message = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $sender->id,
        'message' => 'Test message',
        'is_read' => false,
    ]);

    $message->forceFill([
        'created_at' => Carbon::parse('2026-04-28 10:00:00'),
        'updated_at' => Carbon::parse('2026-04-28 10:00:00'),
    ])->save();

    $resource = (new MessageResource($message))->toArray(request());

    expect($resource['formatted_time'])->toBe('2 hours ago');

    Carbon::setTestNow();
});
