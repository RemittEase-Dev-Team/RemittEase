<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KYC extends Model
{
    protected $table = 'kycs';
    use HasFactory;

    protected $fillable = [
        'user_id',
        'applicant_id',
        'check_id',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
