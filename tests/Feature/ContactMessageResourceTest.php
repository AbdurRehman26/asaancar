<?php

use App\Models\ContactMessage;
use App\Models\User;
use Spatie\Permission\Models\Role;

it('shows inquiries in the filament admin resource', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    ContactMessage::query()->create([
        'name' => 'Ayesha Khan',
        'contact_info' => 'ayesha@example.com',
        'message' => 'I want to know more about your ride options from DHA to Clifton.',
    ]);

    $this->actingAs($admin)
        ->get(route('filament.admin.resources.contact-messages.index'))
        ->assertSuccessful()
        ->assertSee('Inquiries')
        ->assertSee('Ayesha Khan')
        ->assertSee('ayesha@example.com')
        ->assertSee('ride options from DHA to Clifton');
});
