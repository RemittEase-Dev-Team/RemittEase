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
        'secret_key',
        'status',
        'balance',
        'is_verified'
    ];

    protected $casts = [
        'balance' => 'decimal:7',
        'is_verified' => 'boolean'
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

    /**
     * Format the public key for display (first 4 and last 4 characters)
     */
    public function getFormattedPublicKeyAttribute()
    {
        return substr($this->public_key, 0, 4) . '...' . substr($this->public_key, -4);
    }

    /**
     * Get the wallet balance in specific currency
     */
    public function getBalanceInCurrency($currency = 'XLM')
    {
        // This would typically involve a conversion using current rates
        // For now, we'll just return the raw balance
        return $this->balance;
    }
}
