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
use Illuminate\Http\Request;


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

    public function updateHeroes(Request $request)
    {
        $request->validate([
            'content' => 'required|array',
            'content.*.title' => 'required|string|max:255',
            'content.*.subtitle' => 'required|string|max:255',
            'content.*.cta' => 'required|string|max:255',
        ]);

        foreach ($request->content as $hero) {
            Hero::where('id', $hero['id'])->update($hero);
        }

        return redirect()->back()->with('success', 'Heroes updated successfully.');
    }

    public function updateFeatures(Request $request)
    {
        $request->validate([
            'content' => 'required|array',
            'content.*.title' => 'required|string|max:255',
            'content.*.description' => 'required|string',
        ]);

        foreach ($request->content as $feature) {
            Features::where('id', $feature['id'])->update($feature);
        }

        return redirect()->back()->with('success', 'Features updated successfully.');
    }

    public function updateAbouts(Request $request)
    {
        $request->validate([
            'content' => 'required|array',
            'content.*.mission' => 'required|string',
            'content.*.vision' => 'required|string',
            'content.*.core_values' => 'required|string',
            'content.*.sub_1_fees' => 'required|string',
        ]);

        foreach ($request->content as $about) {
            About::where('id', $about['id'])->update($about);
        }

        return redirect()->back()->with('success', 'About sections updated successfully.');
    }

    public function updateQuestRewards(Request $request)
    {
        $request->validate([
            'content' => 'required|array',
            'content.*.title' => 'required|string|max:255',
            'content.*.description' => 'required|string',
            'content.*.rewardPoints' => 'required|integer',
            'content.*.progress' => 'required|integer',
        ]);

        foreach ($request->content as $quest) {
            QuestReward::where('id', $quest['id'])->update([
                'title' => $quest['title'],
                'description' => $quest['description'],
                'reward_points' => $quest['rewardPoints'],
                'progress' => $quest['progress'],
            ]);
        }

        return redirect()->back()->with('success', 'Quest rewards updated successfully.');
    }

    public function updateTeams(Request $request)
    {
        $request->validate([
            'content' => 'required|array',
            'content.*.name' => 'required|string|max:255',
            'content.*.role' => 'required|string|max:255',
            'content.*.description' => 'required|string',
        ]);

        foreach ($request->content as $team) {
            Team::where('id', $team['id'])->update($team);
        }

        return redirect()->back()->with('success', 'Team members updated successfully.');
    }
}
