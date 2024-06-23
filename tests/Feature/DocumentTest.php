<?php

use App\Models\Document;
use App\Models\User;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\putJson;

beforeEach(function (){

    $this->user = User::factory()->create();

    actingAs($this->user);

    Document::factory()->count(5)->create([
        'documentable_id' => $this->user->id,
        'documentable_type' => Document::DOCUMENTABLE_TYPES['user'],
        'document_type' => Document::NIC,
        'document_url' => fake()->url()
    ]);

});

it('stores user document', function () {

    postJson(route('v1.document.store', [
        'document_url' => fake()->url,
        'document_type' => Document::PASSPORT,
        'documentable_type' => 'user',
        'documentable_id' => $this->user->id,
        'is_verified' => true,
    ]))->assertCreated();

});


it('updates user document', function () {

    $document = Document::factory()->create([
        'documentable_id' => $this->user->id,
        'documentable_type' => Document::DOCUMENTABLE_TYPES['user'],
        'document_type' => Document::NIC,
        'document_url' => fake()->url()
    ]);

    putJson(route('v1.document.update', [
        'document' => $document->id,
        'documentable_id' => $this->user->id,
        'document_url' => fake()->url(),
        'documentable_type' => 'user',
        'document_type' => Document::DRIVER_LICENSE,
    ]))->assertOk()
        ->assertJsonFragment([
            'document_type' => Document::DRIVER_LICENSE
        ]);

});

it('returns user documents', function () {

    getJson(route('v1.document.index'))
        ->assertJsonCount(Document::where('documentable_id', $this->user->id)->count(), 'data')
        ->assertOk();
});
