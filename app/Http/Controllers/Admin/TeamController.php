<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Team/Index', [
            'teams' => Team::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'image' => 'required|string',
            'short_desc' => 'required|string',
            'full_desc' => 'required|string',
            'socials' => 'required|json',
        ]);

        Team::create($request->all());

        return redirect()->back()->with('success', 'Team member created successfully.');
    }

    public function update(Request $request, Team $team)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'image' => 'required|string',
            'short_desc' => 'required|string',
            'full_desc' => 'required|string',
            'socials' => 'required|json',
        ]);

        $team->update($request->all());

        return redirect()->back()->with('success', 'Team member updated successfully.');
    }

    public function destroy(Team $team)
    {
        $team->delete();

        return redirect()->back()->with('success', 'Team member deleted successfully.');
    }
}
