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
        'fee_amount',
        'total_amount',
        'status',
        'failure_reason',
        'reference',
        'bank_code',
        'account_number',
        'phone',
        'narration',
        'provider',
        'provider_response'
    ];

    protected $casts = [
        'amount' => 'decimal:8',
        'fee_amount' => 'decimal:8',
        'total_amount' => 'decimal:8',
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
