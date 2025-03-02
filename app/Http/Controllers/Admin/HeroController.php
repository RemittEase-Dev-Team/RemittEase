<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Hero;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HeroController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Hero/Index', [
            'heroes' => Hero::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'required|string|max:255',
            'cta' => 'required|string|max:255',
        ]);

        Hero::create($request->all());

        return redirect()->back()->with('success', 'Hero section created successfully.');
    }

    public function update(Request $request, Hero $hero)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'required|string|max:255',
            'cta' => 'required|string|max:255',
        ]);

        $hero->update($request->all());

        return redirect()->back()->with('success', 'Hero section updated successfully.');
    }

    public function destroy(Hero $hero)
    {
        $hero->delete();

        return redirect()->back()->with('success', 'Hero section deleted successfully.');
    }
}
