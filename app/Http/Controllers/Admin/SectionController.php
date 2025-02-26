<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use Inertia\Inertia;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Sections', [
            'sections' => Section::all()
        ]);
    }

    public function update(Request $request, $id)
    {
        $section = Section::findOrFail($id);
        $section->update(['content' => json_encode($request->content)]);
        return redirect()->back()->with('success', 'Section updated successfully.');
    }
}
