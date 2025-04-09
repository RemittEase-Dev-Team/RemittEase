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
        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'remittance_id')) {
                $table->foreignId('remittance_id')->nullable()->after('recipient_wallet_id')
                    ->references('id')->on('remittances')->nullOnDelete();
            }

            if (!Schema::hasColumn('transactions', 'failure_reason')) {
                $table->text('failure_reason')->nullable()->after('error_message');
            }

            // Drop error_message column if it exists and failure_reason doesn't
            if (Schema::hasColumn('transactions', 'error_message') &&
                Schema::hasColumn('transactions', 'failure_reason')) {
                $table->dropColumn('error_message');
            }

            // Add an index for remittance_id
            if (!Schema::hasColumn('transactions', 'remittance_id')) {
                $table->index('remittance_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            if (Schema::hasColumn('transactions', 'remittance_id')) {
                $table->dropForeign(['remittance_id']);
                $table->dropColumn('remittance_id');
            }

            if (Schema::hasColumn('transactions', 'failure_reason')) {
                $table->dropColumn('failure_reason');
                $table->text('error_message')->nullable();
            }
        });
    }
};
