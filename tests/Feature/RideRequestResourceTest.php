<?php

use App\Models\RideRequest;
use App\Models\User;
use Spatie\Permission\Models\Role;

it('loads the admin ride request index page', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    RideRequest::factory()->create([
        'start_location' => 'Lahore, Pakistan',
        'end_location' => 'Karachi, Pakistan',
    ]);

    $response = $this
        ->actingAs($admin)
        ->get(route('filament.admin.resources.ride-requests.index'));

    $response->assertOk()
        ->assertSee('Lahore, Pakistan')
        ->assertSee('Karachi, Pakistan');
});
