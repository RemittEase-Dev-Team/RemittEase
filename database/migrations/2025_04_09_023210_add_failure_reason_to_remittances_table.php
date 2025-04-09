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
        Schema::table('remittances', function (Blueprint $table) {
            if (!Schema::hasColumn('remittances', 'failure_reason')) {
                $table->text('failure_reason')->nullable()->after('status');
            }

            if (!Schema::hasColumn('remittances', 'fee_amount')) {
                $table->decimal('fee_amount', 20, 8)->nullable()->after('currency');
            }

            if (!Schema::hasColumn('remittances', 'total_amount')) {
                $table->decimal('total_amount', 20, 8)->nullable()->after('fee_amount');
            }

            if (!Schema::hasColumn('remittances', 'phone')) {
                $table->string('phone')->nullable()->after('account_number');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('remittances', function (Blueprint $table) {
            $table->dropColumn(['failure_reason', 'fee_amount', 'total_amount', 'phone']);
        });
    }
};
