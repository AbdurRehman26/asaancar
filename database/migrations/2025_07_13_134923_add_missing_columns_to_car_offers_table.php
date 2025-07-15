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
            // Add missing columns for the service layer
            $table->foreignId('store_id')->nullable()->constrained()->onDelete('cascade')->after('car_id');
            $table->string('title')->nullable()->after('store_id');
            $table->text('description')->nullable()->after('title');
            $table->decimal('discount_percentage', 5, 2)->default(0)->after('description');
            $table->dateTime('start_date')->nullable()->after('discount_percentage');
            $table->dateTime('end_date')->nullable()->after('start_date');
            $table->boolean('is_active')->default(true)->after('end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('car_offers', function (Blueprint $table) {
            // Remove added columns
            $table->dropForeign(['store_id']);
            $table->dropColumn([
                'store_id',
                'title', 
                'description',
                'discount_percentage',
                'start_date',
                'end_date',
                'is_active'
            ]);
        });
    }
};
