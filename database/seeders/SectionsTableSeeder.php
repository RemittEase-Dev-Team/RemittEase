<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Section;

class SectionsTableSeeder extends Seeder
{
    public function run()
    {
        $sections = [
            [
                'name' => 'hero',
                'content' => json_encode([
                    'title' => 'Fast, Low-Cost, Secure Remittances',
                    'subtitle' => 'Send and receive money across borders instantly with low fees and top security.',
                    'cta' => 'Try Now'
                ])
            ],
            [
                'name' => 'features',
                'content' => json_encode([
                    'features' => [
                        ['title' => 'Borderless Transfers', 'description' => 'Powered by Stellar Blockchain for seamless global transactions.'],
                        ['title' => 'Ultra-low Fees', 'description' => 'Enjoy fees under 1% guaranteed for all transactions.'],
                        ['title' => 'Multi-currency Support', 'description' => 'Supports USD, EUR, NGN, and USDC for versatile transactions.']
                    ]
                ])
            ],
            [
                'name' => 'roadmap',
                'content' => json_encode([
                    'milestones' => [
                        ['quarter' => 'Q2 2024', 'details' => 'Company Inauguration & R&D'],
                        ['quarter' => 'Q1 2025', 'details' => 'Secure funding & partnerships.']
                    ]
                ])
            ],
            [
                'name' => 'about',
                'content' => json_encode([
                    'mission' => 'To enable seamless, low-cost, and secure remittances globally.',
                    'vision' => 'A borderless economy where sending money is as easy as sending a message.'
                ])
            ],
            [
                'name' => 'blog',
                'content' => json_encode([
                    'posts' => [
                        ['title' => 'Understanding Web3 Transactions', 'author' => 'Michael Thompson'],
                        ['title' => 'Remittances in the Age of Blockchain', 'author' => 'Emily Carter']
                    ]
                ])
            ],
            [
                'name' => 'quest_rewards',
                'content' => json_encode([
                    'quests' => [
                        ['title' => 'Join Discord', 'reward' => 50],
                        ['title' => 'Complete KYC', 'reward' => 100]
                    ]
                ])
            ],
            [
                'name' => 'team',
                'content' => json_encode([
                    'members' => [
                        ['name' => 'Jane Doe', 'role' => 'CEO'],
                        ['name' => 'John Smith', 'role' => 'CTO']
                    ]
                ])
            ]
        ];

        foreach ($sections as $section) {
            Section::updateOrCreate(['name' => $section['name']], $section);
        }
    }
}
