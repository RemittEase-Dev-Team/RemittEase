<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuestReward;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuestRewardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/QuestReward/Index', [
            'questRewards' => QuestReward::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'reward_points' => 'required|integer',
            'progress' => 'required|integer',
        ]);

        QuestReward::create($request->all());

        return redirect()->back()->with('success', 'Quest reward created successfully.');
    }

    public function update(Request $request, QuestReward $questReward)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'reward_points' => 'required|integer',
            'progress' => 'required|integer',
        ]);

        $questReward->update($request->all());

        return redirect()->back()->with('success', 'Quest reward updated successfully.');
    }

    public function destroy(QuestReward $questReward)
    {
        $questReward->delete();

        return redirect()->back()->with('success', 'Quest reward deleted successfully.');
    }
}
