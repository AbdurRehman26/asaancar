<?php

use App\Models\ContactingStat;
use App\Models\PickAndDrop;
use App\Models\User;
use Spatie\Permission\Models\Role;

it('shows contact stats in the filament table listing', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $user = User::factory()->create([
        'name' => 'Sender User',
    ]);

    $recipient = User::factory()->create([
        'name' => 'Recipient User',
    ]);

    $ride = PickAndDrop::factory()->create([
        'user_id' => $recipient->id,
        'start_location' => 'Lyari',
        'end_location' => 'Surjani Town',
    ]);

    ContactingStat::factory()->create([
        'user_id' => $user->id,
        'recipient_user_id' => $recipient->id,
        'contactable_type' => 'pick_and_drop',
        'contactable_id' => $ride->id,
        'contact_method' => 'whatsapp',
        'interaction_count' => 4,
    ]);

    $this->actingAs($admin)
        ->get(route('filament.admin.resources.contacting-stats.index'))
        ->assertSuccessful()
        ->assertSee('Contact Stats')
        ->assertSee('Sender User')
        ->assertSee('Recipient User')
        ->assertSee('WhatsApp')
        ->assertSee((string) $ride->id)
        ->assertSee('4');
});
