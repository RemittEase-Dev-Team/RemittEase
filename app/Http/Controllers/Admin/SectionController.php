<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Hero;
use App\Models\Features;
use App\Models\Roadmap;
use App\Models\About;
use App\Models\Blog;
use App\Models\QuestReward;
use App\Models\Team;
use Inertia\Inertia;


class SectionController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Sections/Index', [
            'heroes' => Hero::all(),
            'features' => Features::all(),
            'abouts' => About::all(),
            'questRewards' => QuestReward::all(),
            'teams' => Team::all(),
        ]);
    }

   
}
