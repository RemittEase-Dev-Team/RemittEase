<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Hero;

class HeroSeeder extends Seeder
{
    public function run()
    {
        Hero::create([
            'title' => 'Fast, Low-Cost, Secure Remittances',
            'subtitle' => 'Send and receive money across borders instantly with low fees and top security.',
            'cta' => 'Try Now',
        ]);
    }
}
