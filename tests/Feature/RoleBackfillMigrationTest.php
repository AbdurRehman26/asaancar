<?php

use App\Models\Area;
use App\Models\City;
use App\Models\PickAndDrop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

it('renames role id 3 to driver and assigns it to users with pick and drop services', function () {
    $tableNames = config('permission.table_names');
    $columnNames = config('permission.column_names');
    $rolesTable = $tableNames['roles'];
    $modelHasRolesTable = $tableNames['model_has_roles'];
    $rolePivotKey = $columnNames['role_pivot_key'] ?? 'role_id';
    $modelMorphKey = $columnNames['model_morph_key'] ?? 'model_id';

    if (DB::table($rolesTable)->where('id', 3)->exists()) {
        DB::table($rolesTable)->where('id', 3)->update([
            'name' => 'user',
            'guard_name' => 'web',
        ]);
    } else {
        DB::table($rolesTable)->insert([
            'id' => 3,
            'name' => 'user',
            'guard_name' => 'web',
        ]);
    }

    $city = City::create(['name' => 'Karachi']);
    $area = Area::create(['name' => 'Clifton', 'city_id' => $city->id]);

    $driverUser = User::factory()->create();
    $nonDriverUser = User::factory()->create();

    PickAndDrop::factory()->for($driverUser)->create([
        'pickup_city_id' => $city->id,
        'pickup_area_id' => $area->id,
        'dropoff_city_id' => $city->id,
        'dropoff_area_id' => $area->id,
    ]);

    $migration = require database_path('migrations/2026_05_11_091933_rename_role_id_3_to_driver_and_assign_existing_drivers.php');
    $migration->up();

    expect(DB::table($rolesTable)->where('id', 3)->value('name'))->toBe('driver');

    expect(DB::table($modelHasRolesTable)->where([
        $rolePivotKey => 3,
        'model_type' => User::class,
        $modelMorphKey => $driverUser->id,
    ])->exists())->toBeTrue();

    expect(DB::table($modelHasRolesTable)->where([
        $rolePivotKey => 3,
        'model_type' => User::class,
        $modelMorphKey => $nonDriverUser->id,
    ])->exists())->toBeFalse();
});
