<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'role', 'image', 'short_desc', 'full_desc', 'socials'];

    protected $casts = [
        'socials' => 'array',
    ];
}
