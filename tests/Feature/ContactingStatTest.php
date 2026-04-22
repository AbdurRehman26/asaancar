<?php

use App\Models\ContactingStat;
use App\Models\PickAndDrop;
use App\Models\RideRequest;
use App\Models\User;

it('creates a contacting stat row for a pick and drop contact action', function () {
    $user = User::factory()->create();
    $recipient = User::factory()->create();
    $service = PickAndDrop::factory()->create([
        'user_id' => $recipient->id,
    ]);

    $response = $this
        ->actingAs($user)
        ->postJson('/api/contacting-stats', [
            'recipient_user_id' => $recipient->id,
            'contactable_type' => 'pick_and_drop',
            'contactable_id' => $service->id,
            'contact_method' => 'whatsapp',
        ]);

    $response->assertSuccessful()
        ->assertJsonPath('data.interaction_count', 1);

    $this->assertDatabaseHas('contacting_stats', [
        'user_id' => $user->id,
        'recipient_user_id' => $recipient->id,
        'contactable_type' => 'pick_and_drop',
        'contactable_id' => $service->id,
        'contact_method' => 'whatsapp',
        'interaction_count' => 1,
    ]);
});

it('increments an existing contacting stat row instead of creating a duplicate', function () {
    $user = User::factory()->create();
    $recipient = User::factory()->create();
    $rideRequest = RideRequest::factory()->create([
        'user_id' => $recipient->id,
    ]);

    $payload = [
        'recipient_user_id' => $recipient->id,
        'contactable_type' => 'ride_request',
        'contactable_id' => $rideRequest->id,
        'contact_method' => 'chat',
    ];

    $this->actingAs($user)->postJson('/api/contacting-stats', $payload)->assertSuccessful();

    $secondResponse = $this->actingAs($user)->postJson('/api/contacting-stats', $payload);

    $secondResponse->assertSuccessful()
        ->assertJsonPath('data.interaction_count', 2);

    expect(
        ContactingStat::query()
            ->where('user_id', $user->id)
            ->where('recipient_user_id', $recipient->id)
            ->where('contactable_type', 'ride_request')
            ->where('contactable_id', $rideRequest->id)
            ->where('contact_method', 'chat')
            ->count()
    )->toBe(1);
});

it('rejects a recipient that does not own the contacted listing', function () {
    $user = User::factory()->create();
    $recipient = User::factory()->create();
    $otherRecipient = User::factory()->create();
    $service = PickAndDrop::factory()->create([
        'user_id' => $recipient->id,
    ]);

    $response = $this
        ->actingAs($user)
        ->postJson('/api/contacting-stats', [
            'recipient_user_id' => $otherRecipient->id,
            'contactable_type' => 'pick_and_drop',
            'contactable_id' => $service->id,
            'contact_method' => 'call',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['recipient_user_id']);
});
