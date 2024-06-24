<?php

use App\Models\City;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        City::query()->createOrFirst([
            'code' => 'pk_khi',
            'name' => 'Karachi'
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
