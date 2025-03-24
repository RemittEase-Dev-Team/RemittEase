<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use function str_replace;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class TeamController extends Controller
{
    public function index()
    {
        try {
            $teams = Team::all()->map(function ($team) {
                if ($team->image) {
                    $team->image_url = asset('storage/' . $team->image);
                }
                return $team;
            });

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
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'role' => 'required|string|max:255',
                'short_desc' => 'required|string',
                'full_desc' => 'required|string',
                'socials' => 'required|array',
                'socials.twitter' => 'nullable|string',
                'socials.github' => 'nullable|string',
                'socials.linkedin' => 'nullable|string',
                'image' => 'nullable|image|max:5120'
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $fileName = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                $imagePath = $file->storeAs('team-images', $fileName, 'public');
            }

            $team = new Team;
            $team->name = $request->name;
            $team->role = $request->role;
            $team->short_desc = $request->short_desc;
            $team->full_desc = $request->full_desc;
            $team->socials = $request->socials;
            $team->image = $imagePath;
            $team->save();

            return redirect()->route('admin.teams.index')->with('success', 'Team member created successfully.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create team member: ' . $e->getMessage());
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
            // Add the full image URL
            if ($team->image) {
                $team->image_url = asset('storage/' . $team->image);
            }

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
        try {
            $request->validate([
                'name' => 'nullable|string|max:255',
                'role' => 'nullable|string|max:255',
                'short_desc' => 'nullable|string',
                'full_desc' => 'nullable|string',
                'socials' => 'nullable|array',
                'socials.twitter' => 'nullable|string',
                'socials.github' => 'nullable|string',
                'socials.linkedin' => 'nullable|string',
                'image' => 'nullable|image|max:5120'
            ]);

            if ($request->has('name')) {
                $team->name = $request->name;
            }

            if ($request->has('role')) {
                $team->role = $request->role;
            }

            if ($request->has('short_desc')) {
                $team->short_desc = $request->short_desc;
            }

            if ($request->has('full_desc')) {
                $team->full_desc = $request->full_desc;
            }

            if ($request->has('socials')) {
                $team->socials = $request->socials;
            }

            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($team->image && Storage::disk('public')->exists($team->image)) {
                    Storage::disk('public')->delete($team->image);
                }

                $file = $request->file('image');
                $fileName = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                $team->image = $file->storeAs('team-images', $fileName, 'public');
            }

            $team->save();

            return redirect()->back()->with('success', 'Team member updated successfully.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update team member: ' . $e->getMessage());
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
