<?php

use App\Models\RideRequest;
use App\Models\User;

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
