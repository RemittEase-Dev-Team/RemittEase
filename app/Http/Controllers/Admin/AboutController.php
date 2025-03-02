<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\About;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AboutController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/About/Index', [
            'abouts' => About::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'mission' => 'required|string',
            'vision' => 'required|string',
        ]);

        About::create($request->all());

        return redirect()->back()->with('success', 'About section created successfully.');
    }

    public function update(Request $request, About $about)
    {
        $request->validate([
            'mission' => 'required|string',
            'vision' => 'required|string',
        ]);

        $about->update($request->all());

        return redirect()->back()->with('success', 'About section updated successfully.');
    }

    public function destroy(About $about)
    {
        $about->delete();

        return redirect()->back()->with('success', 'About section deleted successfully.');
    }
}
