<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Blog;
use Inertia\Inertia;
use Str;

class BlogController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Blogs', [
            'blogs' => Blog::latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/CreateBlog');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'author_id' => 'required|exists:users,id', // Updated to use author_id
        ]);

        // Create the blog post with a slug
        Blog::create([
            'title' => $request->title,
            'content' => $request->content,
            'author_id' => $request->author_id,
            'slug' => Str::slug($request->title), // Automatically generate slug
            'excerpt' => $request->excerpt ?? '', // Optional excerpt
            'tags' => $request->tags ?? '', // Optional tags
        ]);

        return redirect()->route('admin.blogs')->with('success', 'Blog post created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('Admin/EditBlog', [
            'blog' => Blog::findOrFail($id),
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'author_id' => 'required|exists:users,id', // Updated to use author_id
        ]);

        $blog = Blog::findOrFail($id);
        $blog->update([
            'title' => $request->title,
            'content' => $request->content,
            'author_id' => $request->author_id,
            'slug' => Str::slug($request->title), // Automatically update slug
            'excerpt' => $request->excerpt ?? $blog->excerpt, // Optional excerpt
            'tags' => $request->tags ?? $blog->tags, // Optional tags
        ]);

        return redirect()->route('admin.blogs')->with('success', 'Blog post updated successfully.');
    }

    public function destroy($id)
    {
        Blog::findOrFail($id)->delete();
        return redirect()->route('admin.blogs')->with('success', 'Blog post deleted successfully.');
    }
}
