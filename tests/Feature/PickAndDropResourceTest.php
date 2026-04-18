<?php

use App\Models\PickAndDrop;
use App\Models\User;
use Spatie\Permission\Models\Role;

it('loads the admin pick and drop edit page without crashing', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $service = PickAndDrop::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->get(route('filament.admin.resources.pick-and-drops.edit', ['record' => $service]));

    $response->assertOk();
});
