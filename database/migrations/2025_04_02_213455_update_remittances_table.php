<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('remittances', function (Blueprint $table) {
            // Add new columns after existing ones
            $table->foreignId('recipient_id')->nullable()->after('recipient')->constrained('recipients');
            $table->string('reference')->nullable()->after('status')->unique();
            $table->string('bank_code')->nullable()->after('reference');
            $table->string('account_number')->nullable()->after('bank_code');
            $table->string('narration')->nullable()->after('account_number');
            $table->string('provider')->default('flutterwave')->after('narration');
            $table->json('provider_response')->nullable()->after('provider');

            // Modify existing columns if needed
            $table->string('recipient')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('remittances', function (Blueprint $table) {
            $table->dropForeign(['recipient_id']);
            $table->dropColumn([
                'recipient_id',
                'reference',
                'bank_code',
                'account_number',
                'narration',
                'provider',
                'provider_response'
            ]);
            $table->string('recipient')->nullable(false)->change();
        });
    }
};