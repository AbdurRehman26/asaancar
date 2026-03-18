<?php

use App\Models\PickAndDrop;
use App\Models\PickAndDropFavorite;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('can list favorite pick and drop services', function () {
    $services = PickAndDrop::factory()->count(3)->create();
    foreach ($services as $service) {
        PickAndDropFavorite::create([
            'user_id' => $this->user->id,
            'pick_and_drop_service_id' => $service->id,
        ]);
    }

    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/customer/pick-and-drop/favorites');

    $response->assertSuccessful()
        ->assertJsonCount(3, 'data');
});

it('can add a service to favorites', function () {
    $service = PickAndDrop::factory()->create();

    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/customer/pick-and-drop/favorites', [
            'pick_and_drop_service_id' => $service->id,
        ]);

    $response->assertStatus(201)
        ->assertJson(['message' => 'Service added to favorites']);

    $this->assertDatabaseHas('pick_and_drop_favorites', [
        'user_id' => $this->user->id,
        'pick_and_drop_service_id' => $service->id,
    ]);
});

it('returns 201 when adding the same service to favorites twice (idempotency)', function () {
    $service = PickAndDrop::factory()->create();
    PickAndDropFavorite::create([
        'user_id' => $this->user->id,
        'pick_and_drop_service_id' => $service->id,
    ]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/customer/pick-and-drop/favorites', [
            'pick_and_drop_service_id' => $service->id,
        ]);

    $response->assertStatus(201);

    expect(PickAndDropFavorite::where('user_id', $this->user->id)->count())->toBe(1);
});

it('can remove a service from favorites', function () {
    $service = PickAndDrop::factory()->create();
    PickAndDropFavorite::create([
        'user_id' => $this->user->id,
        'pick_and_drop_service_id' => $service->id,
    ]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->deleteJson("/api/customer/pick-and-drop/favorites/{$service->id}");

    $response->assertSuccessful()
        ->assertJson(['message' => 'Service removed from favorites']);

    $this->assertDatabaseMissing('pick_and_drop_favorites', [
        'user_id' => $this->user->id,
        'pick_and_drop_service_id' => $service->id,
    ]);
});

it('returns 404 when removing a service not in favorites', function () {
    $service = PickAndDrop::factory()->create();

    $response = $this->actingAs($this->user, 'sanctum')
        ->deleteJson("/api/customer/pick-and-drop/favorites/{$service->id}");

    $response->assertNotFound();
});
