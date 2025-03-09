<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Remittance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'recipient',
        'amount',
        'currency',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
