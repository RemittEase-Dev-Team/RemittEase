<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Features;

class FeaturesSeeder extends Seeder
{
    public function run()
    {
        $features = [
            [
                'title' => 'Borderless Transfers',
                'description' => 'Powered by Stellar Blockchain for seamless global transactions.',
                'icon' => 'Globe',
            ],
            [
                'title' => 'Ultra-low Fees',
                'description' => 'Enjoy fees under 1% guaranteed for all transactions.',
                'icon' => 'DollarSign',
            ],
            [
                'title' => 'Multi-currency Support',
                'description' => 'Supports USD, EUR, NGN, and USDC for versatile transactions.',
                'icon' => 'CreditCard',
            ],
            [
                'title' => 'Secure Wallets',
                'description' => 'Easy recovery options with top-notch security.',
                'icon' => 'Shield',
            ],
            [
                'title' => 'Instant Liquidity',
                'description' => 'Convert funds between fiat and crypto instantly.',
                'icon' => 'Zap',
            ],
        ];

        foreach ($features as $feature) {
            Features::create($feature);
        }
    }
}
