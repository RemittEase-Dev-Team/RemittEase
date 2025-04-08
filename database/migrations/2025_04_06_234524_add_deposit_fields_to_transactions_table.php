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
            $table->string('provider')->nullable()->after('type');
            $table->json('metadata')->nullable()->after('provider');
            $table->text('error_message')->nullable()->after('metadata');
            $table->string('external_id')->nullable()->after('error_message');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['provider', 'metadata', 'error_message', 'external_id']);
        });
    }
};
