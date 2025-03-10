<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount',
        'currency',
        'sender_wallet_id',
        'recipient_wallet_id',
        'recipient_address',
        'transaction_hash',
        'status',
        'transaction_type',
        'external_id',
        'memo'
    ];

    protected $casts = [
        'amount' => 'float',
    ];

    /**
     * Get the user that owns the transaction.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the sender wallet.
     */
    public function senderWallet()
    {
        return $this->belongsTo(Wallet::class, 'sender_wallet_id');
    }

    /**
     * Get the recipient wallet.
     */
    public function recipientWallet()
    {
        return $this->belongsTo(Wallet::class, 'recipient_wallet_id');
    }

    /**
     * Scope a query to only include transactions of a certain type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('transaction_type', $type);
    }

    /**
     * Scope a query to only include successful transactions.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include pending transactions.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Get the Stellar Explorer URL for this transaction.
     */
    public function getStellarExplorerUrlAttribute()
    {
        if (!$this->transaction_hash) {
            return null;
        }

        $network = config('stellar.network', 'testnet');
        $baseUrl = $network === 'testnet'
            ? 'https://stellar.expert/explorer/testnet/tx/'
            : 'https://stellar.expert/explorer/public/tx/';

        return $baseUrl . $this->transaction_hash;
    }
}
