<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestReward extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'reward_points', 'progress'];
}
