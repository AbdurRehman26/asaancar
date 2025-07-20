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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['booking', 'store']);
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->unsignedBigInteger('store_id')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'type', 'booking_id', 'store_id'], 'unique_conversation_context');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
