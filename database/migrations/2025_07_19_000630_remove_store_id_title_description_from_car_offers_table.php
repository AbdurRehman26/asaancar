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
        Schema::table('car_offers', function (Blueprint $table) {
            // Remove the columns
            $table->dropForeign(['store_id']);
            $table->dropColumn(['store_id', 'title', 'description']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('car_offers', function (Blueprint $table) {
            // Add back the columns
            $table->foreignId('store_id')->nullable()->constrained()->onDelete('cascade')->after('car_id');
            $table->string('title')->nullable()->after('store_id');
            $table->text('description')->nullable()->after('title');
        });
    }
};
