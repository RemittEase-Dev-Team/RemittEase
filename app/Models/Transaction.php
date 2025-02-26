<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'amount', 'currency', 'status', 'type', 'recipient', 'reference'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
