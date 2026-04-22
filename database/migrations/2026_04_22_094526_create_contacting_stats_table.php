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
        Schema::create('contacting_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('recipient_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('contactable_type');
            $table->unsignedBigInteger('contactable_id');
            $table->string('contact_method');
            $table->unsignedInteger('interaction_count')->default(0);
            $table->timestamps();

            $table->unique(
                ['user_id', 'recipient_user_id', 'contactable_type', 'contactable_id', 'contact_method'],
                'contacting_stats_unique_contact'
            );
            $table->index(['contactable_type', 'contactable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacting_stats');
    }
};
