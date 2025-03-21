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

        $roadmap->details = explode(',', $roadmap->details);

        return Inertia::render('Admin/Roadmaps/Edit', [
            'roadmap' => $roadmap
        ]);
    }

    public function update(Request $request, Roadmap $roadmap)
    {
        $validatedData = $request->validate([
            'quarter' => 'required|string|max:255',
            'details' => 'required|array',
        ]);

        $validatedData['details'] = implode(',', $validatedData['details']);

        $roadmap->update($validatedData);

        return redirect()->route('admin.roadmap.index')->with('success', 'Roadmap entry updated successfully.');
    }

    public function destroy(Roadmap $roadmap)
    {
        $roadmap->delete();

        return redirect()->back()->with('success', 'Roadmap entry deleted successfully.');
    }
}
