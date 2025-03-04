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
        $validated = $request->validate([
            'name'               => 'nullable|string|max:255',
            'role'               => 'nullable|string|max:255',
            'short_desc'         => 'nullable|string',
            'full_desc'          => 'nullable|string',
            'socials'            => 'array',  // or 'socials' => 'nullable|array'
            'socials.twitter'    => 'nullable|string',
            'socials.github'     => 'nullable|string',
            'socials.linkedin'   => 'nullable|string',
            'image'              => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // If file was uploaded, store it
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('public/team-images');
            // Convert "public/team-images/xxxx" -> "storage/team-images/xxxx"
            $validated['image'] = str_replace('public/', 'storage/', $path);
        }

        // Now create the model
        Team::create($validated);

        return redirect()->route('admin.teams.index')->with('success', 'Team member created successfully!');
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
        $validated = $request->validate([
            'name'               => 'nullable|string|max:255',
            'role'               => 'nullable|string|max:255',
            'short_desc'         => 'nullable|string',
            'full_desc'          => 'nullable|string',
            'socials'            => 'nullable|array',  // or 'socials' => 'nullable|array'
            'socials.twitter'    => 'nullable|string',
            'socials.github'     => 'nullable|string',
            'socials.linkedin'   => 'nullable|string',
            'image'              => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // If a new file is uploaded, store it
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('public/team-images');
            $validated['image'] = str_replace('public/', 'storage/', $path);
        } else {
            // If user didn't select a new file, remove 'image' to avoid overwriting
            unset($validated['image']);
        }

        // Check if the possible data is set for every value to add it to the updated and update the db with the model of the arrays of data to ensure they always set and post
        if($team && $team != null) {
            if(isset($validated['name'])) $team->name = $validated['name'];
            if(isset($validated['role'])) $team->role = $validated['role'];
            if(isset($validated['short_desc'])) $team->short_desc = $validated['short_desc'];
            if(isset($validated['full_desc'])) $team->full_desc = $validated['full_desc'];
            if(isset($validated['socials'])) $team->socials = $validated['socials'];
            if(isset($validated['image'])) $team->image = $validated['image'];
            $team->update();
        }else{
            $team = Team::create($validated);
        }

        return redirect()->route('admin.teams.index')->with('success', 'Team member updated successfully!');
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
