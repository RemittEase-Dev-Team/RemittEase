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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('app_name');
            $table->string('app_version');
            $table->string('currency');
            $table->string('default_currency');
            $table->decimal('transaction_fee', 8, 2);
            $table->decimal('max_transaction_limit', 20, 8);
            $table->decimal('min_transaction_limit', 20, 8);
            $table->json('supported_currencies')->nullable();
            $table->string('stellar_network')->nullable();
            $table->string('api_key')->nullable();
            $table->string('api_secret')->nullable();
            $table->boolean('maintenance_mode')->default(false);
            $table->string('contact_email')->nullable();
            $table->string('support_phone')->nullable();
            $table->string('terms_of_service_url')->nullable();
            $table->string('privacy_policy_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
