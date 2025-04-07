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
        Schema::dropIfExists('transactions');

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('provider')->nullable(); // moonpay, linkio, yellowcard, etc.
            $table->string('external_id')->nullable(); // External transaction ID from provider
            $table->decimal('amount', 20, 8);
            $table->string('currency')->default('XLM');
            $table->string('asset_code')->default('XLM');
            $table->string('recipient_address');
            $table->foreignId('sender_wallet_id')->nullable()->constrained('wallets')->nullOnDelete();
            $table->foreignId('recipient_wallet_id')->nullable()->constrained('wallets')->nullOnDelete();
            $table->string('transaction_hash')->nullable(); // Blockchain transaction hash
            $table->string('type')->default('deposit'); // deposit, withdrawal, transfer
            $table->string('status')->default('pending'); // pending, completed, failed
            $table->string('reference')->unique(); // Unique transaction reference
            $table->text('memo')->nullable();
            $table->json('metadata')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            // Indexes for better query performance
            $table->index(['user_id', 'type']);
            $table->index('status');
            $table->index('created_at');
            $table->index('external_id');
            $table->index('provider');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
