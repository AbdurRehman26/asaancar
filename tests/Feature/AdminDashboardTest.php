<?php

use App\Models\PickAndDrop;
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
