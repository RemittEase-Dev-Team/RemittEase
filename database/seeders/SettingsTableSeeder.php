<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SettingsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('settings')->insert([
            [
                'app_name' => 'RemittEase',
                'app_version' => '1.0.0',
                'currency' => 'USD',
                'default_currency' => 'USD',
                'transaction_fee' => '2.5',
                'max_transaction_limit' => '10000',
                'min_transaction_limit' => '10',
                'supported_currencies' => json_encode(['USD', 'EUR', 'NGN', 'GBP']),
                'stellar_network' => 'Testnet',
                'api_key' => 'your-api-key-here',
                'api_secret' => 'your-api-secret-here',
                'maintenance_mode' => false,
                'contact_email' => 'support@remittease.com',
                'support_phone' => '+2734567890',
                'terms_of_service_url' => 'https://remittease.com/terms',
                'privacy_policy_url' => 'https://remittease.com/privacy',
                'site_url' => 'https://remittease.com',
                'exchange_rate_api' => 'https://api.exchangeratesapi.io/latest',
                'support_email' => 'support@remittease.com',
                'kyc_verification_provider' => 'Onfido',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]
        ]);
    }
}
