<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'image',
        'author_id', // Changed to author_id for clarity
        'slug',
        'excerpt',
        'tags',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id'); // Updated to match the new field name
    }

    // Adding a method to retrieve the tags as an array
    public function getTagsArrayAttribute()
    {
        return explode(',', $this->tags);
    }
}
