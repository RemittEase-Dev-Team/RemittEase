<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('kyc_status')->default('pending');
            $table->string('onfido_applicant_id')->nullable();
            $table->string('onfido_check_id')->nullable();
            $table->text('onfido_sdk_token')->nullable();
            $table->timestamp('kyc_verified_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'kyc_status',
                'onfido_applicant_id',
                'onfido_check_id',
                'onfido_sdk_token',
                'kyc_verified_at'
            ]);
        });
    }
};
