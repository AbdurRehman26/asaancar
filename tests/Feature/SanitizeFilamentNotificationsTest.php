<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

it('sanitizes malformed filament notification session payloads on admin pages', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->withSession([
            'filament.notifications' => [
                1,
                [
                    'id' => 'valid-notification',
                    'actions' => [],
                    'body' => 'Body',
                    'color' => null,
                    'duration' => 6000,
                    'icon' => null,
                    'iconColor' => null,
                    'status' => 'success',
                    'title' => 'Valid',
                    'view' => 'filament-notifications::notification',
                    'viewData' => [],
                ],
            ],
        ])
        ->get(route('filament.admin.pages.dashboard'))
        ->assertSuccessful();
});
