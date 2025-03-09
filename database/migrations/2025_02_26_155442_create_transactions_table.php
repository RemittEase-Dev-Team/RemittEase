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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_wallet_id')->nullable()->constrained('wallets')->nullOnDelete();
            $table->string('recipient_address');
            $table->foreignId('recipient_wallet_id')->nullable()->constrained('wallets')->nullOnDelete();
            $table->decimal('amount', 20, 7);
            $table->string('asset_code')->default('XLM');
            $table->string('transaction_hash')->nullable();
            $table->text('memo')->nullable();
            $table->enum('type', ['deposit', 'withdrawal', 'transfer']);
            $table->enum('status', ['pending', 'completed', 'failed']);
            $table->string('reference')->unique();
            $table->timestamps();
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
