<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KYC extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'onfido_applicant_id', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
