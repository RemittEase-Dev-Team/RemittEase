<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\About;

class AboutSeeder extends Seeder
{
    public function run()
    {
        About::create([
            'mission' => 'To enable seamless, low-cost, and secure remittances globally.',
            'vision' => 'A borderless economy where sending money is as easy as sending a message.',
            'core_values' => json_encode([
                [
                    'title' => 'Security',
                    'description' => 'Blockchain encryption keeps your money safe.',
                ],
                [
                    'title' => 'Decentralization',
                    'description' => 'No banks, no middlemen—just fast transfers.',
                ],
                [
                    'title' => 'Affordability',
                    'description' => 'Under 1% fees—lower than banks and competitors.',
                ],
            ]),
            'sub_1_fees' => json_encode([
                'description' => 'Ultra-low fees—under 1%! Keep more of your money with RemittEase.',
                'fees' => [0.8, 0.7, 0.6],
            ]),
        ]);
    }
}
