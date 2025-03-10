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
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('public_key')->unique();
            $table->text('secret_key');
            $table->string('status')->default('pending');
            $table->decimal('balance', 20, 7)->default(0);
            $table->boolean('is_verified')->default(false);
            $table->timestamps();

            $table->index('user_id');
            $table->index('public_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
