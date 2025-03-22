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
use Carbon\Carbon;
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
            if (isset($hero['created_at'])) {
                $hero['created_at'] = Carbon::parse($hero['created_at'])->format('Y-m-d H:i:s');
            }
            if (isset($hero['updated_at'])) {
                $hero['updated_at'] = Carbon::parse($hero['updated_at'])->format('Y-m-d H:i:s');
            }
            
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
            if(isset($feature['created_at'])){
                $feature['created_at'] = Carbon::parse($feature['created_at'])->format('Y-m-d H:i:s');
            }
            if(isset($feature['updated_at'])){
                $feature['updated_at'] = Carbon::parse($feature['updated_at'])->format('Y-m-d H:i:s');
            }
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
            if(isset($about['created_at'])){
                $about['created_at'] = Carbon::parse($about['created_at'])->format('Y-m-d H:i:s');
            }
            if(isset($about['updated_at'])){
                $about['updated_at'] = Carbon::parse($about['updated_at'])->format('Y-m-d H:i:s');
            }
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
            if (isset($quest['created_at'])) {
                $quest['created_at'] = Carbon::parse($quest['created_at'])->format('Y-m-d H:i:s');
            }
            if (isset($quest['updated_at'])) {
                $quest['updated_at'] = Carbon::parse($quest['updated_at'])->format('Y-m-d H:i:s');
            }
    
            // If an ID is provided, update. Otherwise, create a new record.
            if (isset($quest['id']) && $quest['id']) {
                QuestReward::where('id', $quest['id'])->update([
                    'title'         => $quest['title'],
                    'description'   => $quest['description'],
                    'reward_points' => $quest['rewardPoints'],
                    'progress'      => $quest['progress'],
                    'created_at'    => $quest['created_at'] ?? null,
                    'updated_at'    => $quest['updated_at'] ?? null,
                ]);
            } else {
                QuestReward::create([
                    'title'         => $quest['title'],
                    'description'   => $quest['description'],
                    'reward_points' => $quest['rewardPoints'],
                    'progress'      => $quest['progress'],
                ]);
            }
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
            if(isset($team['created_at'])){
                $team['created_at'] = Carbon::parse($team['created_at'])->format('Y-m-d H:i:s');
            }
            if(isset($team['updated_at'])){
                $team['updated_at'] = Carbon::parse($team['updated_at'])->format('Y-m-d H:i:s');
            }
            Team::where('id', $team['id'])->update($team);
        }

        return redirect()->back()->with('success', 'Team members updated successfully.');
    }
}
