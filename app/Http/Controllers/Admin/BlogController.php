<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'tags' => 'required|string'
        ]);

        $request->merge(['slug' => Str::slug($request->title)]);
        $request->merge(['author' => auth()->user()->name]);
        $request->merge(['image' => $request->file('image')->store('blogs', 'public')]);

        Blog::create($request->only(['title', 'slug', 'author', 'content', 'image', 'tags']));

        return redirect('/blogs')->with('success', 'Blog post created successfully.');
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
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'image' => 'nullable',
        ]);

        if ($request->has('title')) {
            $slug = Str::slug($request->title);
            $existingBlog = Blog::where('slug', $slug)->first();
            if ($existingBlog && $existingBlog->id !== $blog->id) {
                $slug = $slug . '-' . Str::random(8);
            }
            $request->merge(['slug' => $slug]);
        }
        if ($request->hasFile('image')) {
            $request->merge(['image' => $request->file('image')->store('blogs', 'public')]);
        }

        if ($request->has('title')) {
            $blog->title = $request->title;
        }
        if ($request->has('slug')) {
            $blog->slug = $request->slug;
        }
        if ($request->has('content')) {
            $blog->content = $request->content;
        }
        if ($request->has('image')) {
            $blog->image = $request->image;
        }
        $blog->user_id = auth()->id();
        $blog->save();

        return redirect()->back()->with('success', 'Blog post updated successfully.');
    }

    public function destroy(Blog $blog)
    {
        $blog->delete();

        return redirect()->back()->with('success', 'Blog post deleted successfully.');
    }
}
