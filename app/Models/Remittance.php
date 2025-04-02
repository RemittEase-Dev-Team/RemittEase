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
        'recipient_id',
        'amount',
        'currency',
        'status',
        'reference',
        'bank_code',
        'account_number',
        'narration',
        'provider',
        'provider_response'
    ];

    protected $casts = [
        'amount' => 'decimal:8',
        'provider_response' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function recipient()
    {
        return $this->belongsTo(Recipient::class);
    }
}
