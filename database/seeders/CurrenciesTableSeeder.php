<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Currency;

class CurrenciesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currencies = [
            ['code' => 'XLM', 'name' => 'Stellar Lumens', 'flag' => '🌌', 'status' => true],
            ['code' => 'USD', 'name' => 'United States Dollar', 'flag' => '🇺🇸', 'status' => true],
            ['code' => 'NGN', 'name' => 'Nigerian Naira', 'flag' => '🇳🇬', 'status' => true],
            ['code' => 'GBP', 'name' => 'British Pound Sterling', 'flag' => '🇬🇧', 'status' => true],
            ['code' => 'AED', 'name' => 'United Arab Emirates Dirham', 'flag' => '🇦🇪', 'status' => true],
            ['code' => 'EUR', 'name' => 'Euro', 'flag' => '🇪🇺', 'status' => true],
            ['code' => 'JPY', 'name' => 'Japanese Yen', 'flag' => '🇯🇵', 'status' => true],
            ['code' => 'CAD', 'name' => 'Canadian Dollar', 'flag' => '🇨🇦', 'status' => true],
            ['code' => 'AUD', 'name' => 'Australian Dollar', 'flag' => '🇦🇺', 'status' => true],
            ['code' => 'CHF', 'name' => 'Swiss Franc', 'flag' => '🇨🇭', 'status' => true],
            ['code' => 'NZD', 'name' => 'New Zealand Dollar', 'flag' => '🇳🇿', 'status' => true],
            ['code' => 'SGD', 'name' => 'Singapore Dollar', 'flag' => '🇸🇬', 'status' => true],
            ['code' => 'HKD', 'name' => 'Hong Kong Dollar', 'flag' => '🇭🇰', 'status' => true],
            ['code' => 'SEK', 'name' => 'Swedish Krona', 'flag' => '🇸🇪', 'status' => true],
            ['code' => 'ZAR', 'name' => 'South African Rand', 'flag' => '🇿🇦', 'status' => true],
            ['code' => 'BRL', 'name' => 'Brazilian Real', 'flag' => '🇧🇷', 'status' => true],
            ['code' => 'RUB', 'name' => 'Russian Ruble', 'flag' => '🇷🇺', 'status' => true],
            ['code' => 'INR', 'name' => 'Indian Rupee', 'flag' => '🇮🇳', 'status' => true],
            ['code' => 'MXN', 'name' => 'Mexican Peso', 'flag' => '🇲🇽', 'status' => true],
            ['code' => 'NGNC', 'name' => 'Nigerian Naira Coin', 'flag' => '🇳🇬', 'status' => true],
            ['code' => 'USDC', 'name' => 'USD Coin', 'flag' => '💵', 'status' => true]
        ];

        foreach ($currencies as $currency) {
            Currency::create($currency);
        }
    }
}
