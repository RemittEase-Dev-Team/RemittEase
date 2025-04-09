<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For PostgreSQL, we need to alter the enum type
        DB::statement("ALTER TABLE remittances DROP CONSTRAINT IF EXISTS remittances_status_check");
        DB::statement("ALTER TABLE remittances ADD CONSTRAINT remittances_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE remittances DROP CONSTRAINT IF EXISTS remittances_status_check");
        DB::statement("ALTER TABLE remittances ADD CONSTRAINT remittances_status_check CHECK (status IN ('pending', 'completed', 'failed'))");
    }
};
