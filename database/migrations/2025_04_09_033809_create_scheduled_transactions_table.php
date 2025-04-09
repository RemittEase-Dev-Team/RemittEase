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
        Schema::create('scheduled_transactions', function (Blueprint $table) {
            $table->id();
            $table->json('transaction_ids')->comment('Array of transaction IDs to process');
            $table->enum('schedule_type', ['hourly', 'daily', 'weekly'])->default('daily');
            $table->timestamp('next_execution')->index();
            $table->timestamp('last_executed_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_recurring')->default(false);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scheduled_transactions');
    }
};
