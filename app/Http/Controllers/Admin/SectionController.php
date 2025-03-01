<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Sections/Index', [
            'sections' => Section::all()
        ]);
    }

    public function update(Request $request, $id)
    {
        $section = Section::findOrFail($id);
        if (!empty($request->content)) {
            $section->update(['content' => json_encode($request->content)]);
        }
        return redirect()->back()->with('success', 'Section updated successfully.');
    }
}
