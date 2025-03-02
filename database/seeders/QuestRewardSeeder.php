<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\QuestReward;

class QuestRewardSeeder extends Seeder
{
    public function run()
    {
        $questRewards = [
            [
                'title' => 'Join Our Discord',
                'description' => 'Introduce yourself in the #introductions channel.',
                'reward_points' => 50,
                'progress' => 100,
                'icon' => '<Star/>',
            ],
            [
                'title' => 'Twitter Engagement',
                'description' => 'Like and Retweet our pinned post.',
                'reward_points' => 40,
                'progress' => 80,
                'icon' => '<Award/>',
            ],
            [
                'title' => 'Invite a Friend',
                'description' => 'Invite a friend to RemittEase and have them join Discord or Twitter.',
                'reward_points' => 70,
                'progress' => 60,
                'icon' => '<Star/>',
            ],
            [
                'title' => 'Complete KYC',
                'description' => 'Verify your identity to start sending higher transaction amounts.',
                'reward_points' => 100,
                'progress' => 20,
                'icon' => '<CheckCircle2/>',
            ],
            [
                'title' => 'Participate in AMA',
                'description' => 'Attend our next AMA and ask a question.',
                'reward_points' => 40,
                'progress' => 0,
                'icon' => '<Award/>',
            ],
            [
                'title' => 'Bug Bounty',
                'description' => 'Find and report a valid bug or vulnerability.',
                'reward_points' => 150,
                'progress' => 100,
                'icon' => '<Star/>',
            ],
        ];

        foreach ($questRewards as $questReward) {
            QuestReward::create($questReward);
        }
    }
}
