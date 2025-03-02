<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class TeamController extends Controller
{
    public function index()
    {
        try {
            $teams = Team::all();
            return Inertia::render('Admin/Teams/Index', [
                'teams' => $teams
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching teams: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to load team members.');
        }
    }

    public function create()
    {
        return Inertia::render('Admin/Teams/Create');
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

        try {
            Team::create($request->all());
            return redirect()->route('admin.teams.index')->with('success', 'Team member created successfully.');
        } catch (\Exception $e) {
            Log::error('Error creating team member: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to create team member.');
        }
    }

    public function show(Team $team)
    {
        try {
            return Inertia::render('Admin/Teams/Show', [
                'team' => $team
            ]);
        } catch (\Exception $e) {
            Log::error('Error showing team member: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to load team member details.');
        }
    }

    public function edit(Team $team)
    {
        try {
            return Inertia::render('Admin/Teams/Edit', [
                'team' => $team
            ]);
        } catch (\Exception $e) {
            Log::error('Error editing team member: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to load team member for editing.');
        }
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

        try {
            $team->update($request->all());
            return redirect()->route('admin.teams.index')->with('success', 'Team member updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating team member: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update team member.');
        }
    }

    public function destroy(Team $team)
    {
        try {
            $team->delete();
            return redirect()->route('admin.teams.index')->with('success', 'Team member deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting team member: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete team member.');
        }
    }
}
