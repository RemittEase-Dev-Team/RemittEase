<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Only add kyc_status if it doesn't exist
            if (!Schema::hasColumn('users', 'kyc_status')) {
                $table->string('kyc_status')->default('pending');
            }

            // Add new Onfido-specific columns
            if (!Schema::hasColumn('users', 'onfido_applicant_id')) {
                $table->string('onfido_applicant_id')->nullable();
            }
            if (!Schema::hasColumn('users', 'onfido_check_id')) {
                $table->string('onfido_check_id')->nullable();
            }
            if (!Schema::hasColumn('users', 'onfido_sdk_token')) {
                $table->text('onfido_sdk_token')->nullable();
            }
            if (!Schema::hasColumn('users', 'kyc_verified_at')) {
                $table->timestamp('kyc_verified_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Only drop columns that exist
            $columns = [
                'onfido_applicant_id',
                'onfido_check_id',
                'onfido_sdk_token',
                'kyc_verified_at'
            ];

            // Filter out columns that don't exist
            $columnsToDrop = array_filter($columns, function($column) {
                return Schema::hasColumn('users', $column);
            });

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }

            // Don't drop kyc_status as it might be used by other parts of the application
        });
    }
};
