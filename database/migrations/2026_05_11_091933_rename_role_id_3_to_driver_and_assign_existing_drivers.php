<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');
        $rolesTable = $tableNames['roles'];
        $modelHasRolesTable = $tableNames['model_has_roles'];
        $rolePivotKey = $columnNames['role_pivot_key'] ?? 'role_id';
        $modelMorphKey = $columnNames['model_morph_key'] ?? 'model_id';

        $driverRole = DB::table($rolesTable)
            ->where('id', 3)
            ->first();

        if ($driverRole) {
            DB::table($rolesTable)
                ->where('id', 3)
                ->update([
                    'name' => 'driver',
                    'guard_name' => 'web',
                ]);
        } else {
            DB::table($rolesTable)->insert([
                'id' => 3,
                'name' => 'driver',
                'guard_name' => 'web',
            ]);
        }

        $driverUserIds = DB::table('pick_and_drop_services')
            ->distinct()
            ->pluck('user_id')
            ->filter()
            ->values();

        foreach ($driverUserIds as $userId) {
            $alreadyAssigned = DB::table($modelHasRolesTable)
                ->where($rolePivotKey, 3)
                ->where('model_type', User::class)
                ->where($modelMorphKey, $userId)
                ->exists();

            if ($alreadyAssigned) {
                continue;
            }

            DB::table($modelHasRolesTable)->insert([
                $rolePivotKey => 3,
                'model_type' => User::class,
                $modelMorphKey => $userId,
            ]);
        }
    }

    public function down(): void
    {
        $tableNames = config('permission.table_names');
        $rolesTable = $tableNames['roles'];

        DB::table($rolesTable)
            ->where('id', 3)
            ->update([
                'name' => 'user',
                'guard_name' => 'web',
            ]);
    }
};
