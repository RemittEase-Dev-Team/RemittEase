<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index()
    {
        // Get all blogs and add the full image URL
        $blogs = Blog::all()->map(function ($blog) {
            $blog->image_url = $blog->image ? asset('storage/' . $blog->image) : null;
            return $blog;
        });

        return Inertia::render('Admin/Blog/Index', [
            'blogs' => $blogs
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
            'tags' => 'required|string',
            'image' => 'nullable|image|max:5120'
        ]);

        try {
            $imagePath = null;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $fileName = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                $imagePath = $file->storeAs('blogs', $fileName, 'public');
            }

            $userId = Auth::id();

            $blog = new Blog;
            $blog->title = $request->title;
            $blog->slug = Str::slug($request->title);
            $blog->content = $request->content;
            $blog->image = $imagePath;
            $blog->tags = $request->tags;
            $blog->user_id = $userId;
            $blog->save();

            return redirect()->route('admin.blogs')->with('success', 'Blog post created successfully.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create blog post: ' . $e->getMessage());
        }
    }

    public function edit($id)
    {
        $blog = Blog::findOrFail($id);

        // Add the full image URL
        if ($blog->image) {
            $blog->image_url = asset('storage/' . $blog->image);
        }

        return Inertia::render('Admin/Blog/Edit', [
            'blog' => $blog,
        ]);
    }

    public function update(Request $request, $id)
    {
        $blog = Blog::findOrFail($id);

        $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'tags' => 'nullable|string'
        ]);

        try {
            if ($request->has('title')) {
                $slug = Str::slug($request->title);
                $existingBlog = Blog::where('slug', $slug)->where('id', '!=', $blog->id)->first();
                if ($existingBlog) {
                    $slug = $slug . '-' . Str::random(8);
                }
                $blog->slug = $slug;
                $blog->title = $request->title;
            }

            if ($request->has('image') && $request->image) {
                if ($blog->image && Storage::disk('public')->exists($blog->image)) {
                    Storage::disk('public')->delete($blog->image);
                }

                if (is_string($request->image) && Str::startsWith($request->image, 'data:image')) {
                    $imageData = $request->image;
                    $imageParts = explode(";base64,", $imageData);
                    if (count($imageParts) > 1) {
                        $imageTypeAux = explode("image/", $imageParts[0]);
                        $imageType = count($imageTypeAux) > 1 ? $imageTypeAux[1] : 'jpeg';
                        $imageBase64 = base64_decode($imageParts[1]);
                        $fileName = time() . '_' . Str::random(10) . '.' . $imageType;
                        $filePath = 'blogs/' . $fileName;

                        Storage::disk('public')->put($filePath, $imageBase64);
                        $blog->image = $filePath;
                    }
                }
            }

            if ($request->has('content')) {
                $blog->content = $request->content;
            }

            if ($request->has('tags')) {
                $blog->tags = $request->tags;
            }

            $blog->user_id = Auth::id();
            $blog->save();

            return redirect()->back()->with('success', 'Blog post updated successfully.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update blog post: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $blog = Blog::findOrFail($id);

        // Delete the image if it exists
        if ($blog->image && Storage::disk('public')->exists($blog->image)) {
            Storage::disk('public')->delete($blog->image);
        }

        $blog->delete();

        return redirect()->back()->with('success', 'Blog post deleted successfully.');
    }
}
