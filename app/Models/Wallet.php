<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'public_key',
        'secret_key', // This will be encrypted
        'status'
    ];

    /**
     * Get the user that owns the wallet.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transactions for this wallet.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'sender_wallet_id')
            ->orWhere('recipient_wallet_id', $this->id);
    }
}
