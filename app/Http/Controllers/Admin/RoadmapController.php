<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Roadmap;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoadmapController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Roadmaps/Index', [
            'roadmaps' => Roadmap::all()
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Roadmaps/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'quarter' => 'required|string|max:255',
            'details' => 'required|string',
        ]);

        Roadmap::create($request->only(['quarter', 'details']));

        return redirect()->back()->with('success', 'Roadmap entry created successfully.');
    }

    public function edit($id)
    {
        $roadmap = Roadmap::findOrFail($id);

        // Parse the JSON string to array
        try {
            $roadmap->details = json_decode($roadmap->details, true) ?? [];
        } catch (\Exception $e) {
            $roadmap->details = [];
        }

        return Inertia::render('Admin/Roadmaps/Edit', [
            'roadmap' => $roadmap
        ]);
    }

    public function update(Request $request, Roadmap $roadmap)
    {
        $validatedData = $request->validate([
            'quarter' => 'required|string|max:255',
            'details' => 'required|string',
        ]);

        try {
            // Ensure details is a valid JSON array
            $details = json_decode($validatedData['details'], true);
            if (!is_array($details)) {
                throw new \Exception('Invalid details format');
            }

            $roadmap->update([
                'quarter' => $validatedData['quarter'],
                'details' => json_encode($details) // Re-encode to ensure proper JSON format
            ]);

            return redirect()->route('admin.roadmap.index')
                ->with('success', 'Roadmap entry updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update roadmap. Please ensure details are in correct format.');
        }
    }

    public function destroy(Roadmap $roadmap)
    {
        $roadmap->delete();

        return redirect()->back()->with('success', 'Roadmap entry deleted successfully.');
    }
}
