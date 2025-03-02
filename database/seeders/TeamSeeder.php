<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Team;

class TeamSeeder extends Seeder
{
    public function run()
    {
        $teams = [
            [
                'name' => 'Jane Doe',
                'role' => 'CEO & Co-Founder',
                'image' => 'https://imageplaceholder.net/600x400',
                'short_desc' => 'Visionary leader with a passion for fintech innovation.',
                'full_desc' => 'Jane is a seasoned entrepreneur with over 10 years of experience in the finance and tech industries. She spearheads the strategic direction of RemittEase, ensuring the company stays at the forefront of blockchain remittance solutions.',
                'socials' => json_encode([
                    'twitter' => 'https://twitter.com/',
                    'github' => 'https://github.com/',
                    'linkedin' => 'https://linkedin.com/',
                ]),
            ],
            [
                'name' => 'John Smith',
                'role' => 'CTO & Co-Founder',
                'image' => 'https://imageplaceholder.net/600x400',
                'short_desc' => 'Full-stack blockchain engineer and product architect.',
                'full_desc' => 'John is a tech guru with deep expertise in smart contracts, distributed systems, and scalable infrastructure. He leads our development team to build reliable, cutting-edge solutions.',
                'socials' => json_encode([
                    'twitter' => 'https://twitter.com/',
                    'github' => 'https://github.com/',
                    'linkedin' => 'https://linkedin.com/',
                ]),
            ],
            [
                'name' => 'Sophia Martinez',
                'role' => 'Blockchain Engineer',
                'image' => 'https://imageplaceholder.net/600x400',
                'short_desc' => 'Smart contract wizard with a knack for security.',
                'full_desc' => 'Sophia specializes in blockchain security, ensuring RemittEase’s contracts and protocols are robust and resilient against malicious attacks.',
                'socials' => json_encode([
                    'twitter' => 'https://twitter.com/',
                    'github' => 'https://github.com/',
                    'linkedin' => 'https://linkedin.com/',
                ]),
            ],
            [
                'name' => 'Michael Thompson',
                'role' => 'Smart Contract Developer',
                'image' => 'https://imageplaceholder.net/600x400',
                'short_desc' => 'Passionate about decentralized finance solutions.',
                'full_desc' => 'Michael develops and audits the core smart contracts. He’s a big proponent of open-source collaboration and frequently shares insights with the community.',
                'socials' => json_encode([
                    'twitter' => '',
                    'github' => 'https://github.com/',
                    'linkedin' => 'https://linkedin.com/',
                ]),
            ],
            [
                'name' => 'Emily Carter',
                'role' => 'UI/UX Designer',
                'image' => 'https://imageplaceholder.net/600x400',
                'short_desc' => 'Crafts intuitive and engaging user experiences.',
                'full_desc' => 'Emily blends functionality with stunning design, ensuring RemittEase’s interface is both visually appealing and easy to use for users across the globe.',
                'socials' => json_encode([
                    'twitter' => 'https://twitter.com/',
                    'github' => '',
                    'linkedin' => 'https://linkedin.com/',
                ]),
            ],
            [
                'name' => 'David Wilson',
                'role' => 'Marketing Lead',
                'image' => 'https://imageplaceholder.net/600x400',
                'short_desc' => 'Driving growth and adoption through storytelling.',
                'full_desc' => 'David manages marketing campaigns, brand positioning, and community engagement—making sure the world knows about RemittEase.',
                'socials' => json_encode([
                    'twitter' => 'https://twitter.com/',
                    'github' => '',
                    'linkedin' => 'https://linkedin.com/',
                ]),
            ],
            [
                'name' => 'Anna Lee',
                'role' => 'Head of Partnerships',
                'image' => 'https://imageplaceholder.net/600x400',
                'short_desc' => 'Building strategic alliances across the Web3 ecosystem.',
                'full_desc' => 'Anna forges partnerships with other blockchain companies, payment gateways, and institutions to expand RemittEase’s reach and liquidity options.',
                'socials' => json_encode([
                    'twitter' => '',
                    'github' => '',
                    'linkedin' => 'https://linkedin.com/',
                ]),
            ],
            [
                'name' => 'Chris Evans',
                'role' => 'Community Manager',
                'image' => 'https://imageplaceholder.net/600x400',
                'short_desc' => 'Energizing and supporting our global user base.',
                'full_desc' => 'Chris oversees user feedback, Discord moderation, and event organization, ensuring our community remains active and informed.',
                'socials' => json_encode([
                    'twitter' => 'https://twitter.com/',
                    'github' => '',
                    'linkedin' => 'https://linkedin.com/',
                ]),
            ],
        ];

        foreach ($teams as $team) {
            Team::create($team);
        }
    }
}
