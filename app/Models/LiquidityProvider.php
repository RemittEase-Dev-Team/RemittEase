<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LiquidityProvider extends Model
{
    use HasFactory;

    protected $fillable = ['provider_name', 'api_key', 'status'];
}
