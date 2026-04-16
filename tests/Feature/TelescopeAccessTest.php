<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    putenv('TELESCOPE_ENABLED=true');
    $_ENV['TELESCOPE_ENABLED'] = 'true';
    $_SERVER['TELESCOPE_ENABLED'] = 'true';

    $this->refreshApplication();
    $this->artisan('migrate');
});

test('guests cannot access telescope', function () {
    $response = $this->get('/telescope');

    $response->assertRedirect(route('filament.admin.auth.login'));
});

test('non admin users cannot access telescope', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/telescope');

    $response->assertForbidden();
});

test('admin users can access telescope', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this->actingAs($user)->get('/telescope');

    $response->assertOk();
});
