<?php

use App\Models\PickAndDrop;
use App\Models\RideRequest;
use App\Models\User;
use Spatie\Permission\Models\Role;

it('shows the latest pick and drop services table on the admin dashboard', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $oldestService = PickAndDrop::factory()->create([
        'start_location' => 'Old Route Start',
        'created_at' => now()->subDays(12),
    ]);

    collect(range(1, 10))->each(function (int $index): void {
        PickAndDrop::factory()->create([
            'start_location' => "Recent Route {$index}",
            'created_at' => now()->subDays(10 - $index),
        ]);
    });

    $response = $this
        ->actingAs($admin)
        ->get('/admin');

    $response->assertOk()
        ->assertSee('Recent Route 10')
        ->assertDontSee($oldestService->start_location);
});

it('shows the latest ride requests table on the admin dashboard', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $oldestRequest = RideRequest::factory()->create([
        'start_location' => 'Old Request Start',
        'created_at' => now()->subDays(12),
    ]);

    collect(range(1, 10))->each(function (int $index): void {
        RideRequest::factory()->create([
            'start_location' => "Recent Request {$index}",
            'created_at' => now()->subDays(10 - $index),
        ]);
    });

    $response = $this
        ->actingAs($admin)
        ->get('/admin');

    $response->assertOk()
        ->assertSee('Latest Ride Requests')
        ->assertSee('Recent Request 10')
        ->assertDontSee($oldestRequest->start_location);
});
