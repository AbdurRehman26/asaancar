<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->string('store_username')->unique();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('city');
            $table->string('contact_phone');
            $table->string('address')->nullable();
            $table->timestamps();
            $table->json('data')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
