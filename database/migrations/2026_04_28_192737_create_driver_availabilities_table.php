<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->boolean('is_online')->default(false)->index();
            $table->boolean('is_available')->default(false)->index();
            $table->string('vehicle_type')->nullable()->index();
            $table->timestamp('last_seen_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_availability');
    }
};
