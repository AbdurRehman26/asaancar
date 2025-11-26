<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the unique constraint first
            $table->dropUnique(['email']);
            // Make email nullable
            $table->string('email')->nullable()->change();
            // Re-add unique constraint (nullable columns can have unique constraints)
            $table->unique('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the unique constraint
            $table->dropUnique(['email']);
            // Make email not nullable again
            $table->string('email')->nullable(false)->change();
            // Re-add unique constraint
            $table->unique('email');
        });
    }
};
