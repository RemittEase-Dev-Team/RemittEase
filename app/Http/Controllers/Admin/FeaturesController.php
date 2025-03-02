<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Features;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeaturesController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Features/Index', [
            'features' => Features::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        Features::create($request->all());

        return redirect()->back()->with('success', 'Feature created successfully.');
    }

    public function update(Request $request, Features $feature)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $feature->update($request->all());

        return redirect()->back()->with('success', 'Feature updated successfully.');
    }

    public function destroy(Features $feature)
    {
        $feature->delete();

        return redirect()->back()->with('success', 'Feature deleted successfully.');
    }
}
