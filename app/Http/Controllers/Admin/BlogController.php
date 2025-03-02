<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Str;

class BlogController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Blog/Index', [
            'blogs' => Blog::all()
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Blog/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $request->merge(['slug' => Str::slug($request->title)]);
        $request->merge(['author' => auth()->user()->name]);
        $request->merge(['image' => $request->file('image')->store('blogs', 'public')]);

        Blog::create($request->only(['title', 'slug', 'author', 'content', 'image']));

        return redirect()->back()->with('success', 'Blog post created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('Admin/Blog/Edit', [
            'blog' => Blog::findOrFail($id),
        ]);
    }

    public function update(Request $request, Blog $blog)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $request->merge(['slug' => Str::slug($request->title)]);
        $request->merge(['author' => auth()->user()->name]);
        $request->merge(['image' => $request->file('image')->store('blogs', 'public')]);
        
        $blog->update($request->only(['title', 'slug', 'author', 'content', 'image']));

        return redirect()->back()->with('success', 'Blog post updated successfully.');
    }

    public function destroy(Blog $blog)
    {
        $blog->delete();

        return redirect()->back()->with('success', 'Blog post deleted successfully.');
    }
}
