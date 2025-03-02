<?php

namespace App\Http\Controllers;

use App\Models\Hero;
use App\Models\Features;
use App\Models\Roadmap;
use App\Models\About;
use App\Models\Blog;
use App\Models\QuestReward;
use App\Models\Team;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Welcome', [
            'heroes' => Hero::all(),
            'features' => Features::all(),
            'roadmaps' => Roadmap::all(),
            'abouts' => About::all(),
            'blogs' => Blog::all(),
            'questRewards' => QuestReward::all(),
            'teams' => Team::all(),
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }
}
