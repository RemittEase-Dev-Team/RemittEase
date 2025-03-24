<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Roadmap;

class RoadmapSeeder extends Seeder
{
    public function run()
    {
        $roadmaps = [
            [
                'quarter' => 'Q2 2024 – Our Beginning',
                'details' => json_encode([
                    'R&D: Conducted research across several blockchains.',
                    'Company Inauguration: Official incorporation of RemittEase.',
                ]),
            ],
            [
                'quarter' => 'Q1 – Foundation & Community',
                'details' => json_encode([
                    '🏆 Win Stellar Kickstart Grant – Secure early funding.',
                    '🌍 Build Community (Discord & Twitter) – OG roles, exclusive rewards, and governance perks.',
                    '✅ YellowCard compliance',
                    '🛠 YellowCard sandbox testing environment',
                    '🚀 MoonPay testing environment',
                    '🧐 Finish MVP – A seamless, low-cost blockchain remittance platform.',
                    '🔥 Beta Access – Early testers shape the future.',
                    '🖼 Remi NFT Launch – Utility-packed NFTs for early adopters.',
                    '💰 Early User Rewards – Bonuses for first movers.',
                    '🔒 Private Alpha – Lower fees for high-volume users.',
                    '📢 Yapper Rewards – Twitter engagement earns XP, whitelist spots, and free transactions.',
                ]),
            ],
            [
                'quarter' => 'Q2 – Growth & Testing',
                'details' => json_encode([
                    '💳 Integrate Yellow Card – Smooth fiat on/off-ramping.',
                    '🏆 Win SCF Build Fund – Secure more funding.',
                    '🤝 Partnerships – Major Web3 collaborations.',
                    '🌐 Public Testnet – Open stress-testing.',
                    '👥 Onboard 10K Testnet Users – Rewarded participation.',
                    '🖼 NFT Sale – OGs whitelisted, power users get free NFTs.',
                    '⚡ Quest System – XP leaderboards, hidden rewards.',
                    '🎟 VIP Access – Exclusive Discord channels.',
                    '💬 Twitter Spaces & AMAs – Insights, alpha leaks, industry guests.',
                    '📢 Yapper Rewards – Continued incentives for engagement.',
                ]),
            ],
            [
                'quarter' => 'Q3 – Mainnet & Expansion',
                'details' => json_encode([
                    '🚀 Mainnet V1 (Closed) – Exclusive access for dedicated community members.',
                    '🤝 More Partnerships – Expanding integrations & liquidity.',
                    '⚡ Elite Testers Club – Influence product decisions, enjoy perks.',
                    '📢 Yapper Grand Tournament – Battle for legendary status & prizes.',
                    '🔍 Remi Bug Hunt – Cash rewards & NFTs for top security finds.',
                    '🌐 Making .ease Stellar domain name service for ease of transfer.',
                ]),
            ],
            [
                'quarter' => 'Q4 – Full Launch & Domination',
                'details' => json_encode([
                    '🌍 FULL MAINNET + TGE – OGs and power users reap the rewards.',
                    '💎 The Great Unveiling – A mystery utility drop for early contributors.',
                    '📈 Liquidity Expansion – CEX listings, cross-chain bridges, and incentives.',
                    '⚡ The Final Quest – Limited-time challenge with next-level rewards.',
                    '🛠 DevX Evolution – Open APIs, grants, and more builder tools.',
                    '🏠 Community Council – Governance shifts to the community.',
                    '🎤 RemittEase IRL – Exclusive meetups and speaker sessions.',
                    '🚀 Mega Marketing Blitz – Twitter, YouTube, and influencer campaigns.',
                    'The early believers will win big. Are you in? 🔥',
                ]),
            ],
        ];

        // Clear existing roadmaps
        Roadmap::truncate();

        // Insert new roadmaps
        foreach ($roadmaps as $roadmap) {
            Roadmap::create($roadmap);
        }
    }
}
