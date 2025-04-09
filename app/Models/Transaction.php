<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'provider',
        'external_id',
        'amount',
        'currency',
        'asset_code',
        'recipient_address',
        'sender_wallet_id',
        'recipient_wallet_id',
        'remittance_id',
        'transaction_hash',
        'type',
        'status',
        'reference',
        'memo',
        'metadata',
        'failure_reason'
    ];

    protected $casts = [
        'amount' => 'decimal:8',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected static function boot()
    {
        parent::boot();

        // Auto-generate reference if not provided
        static::creating(function ($transaction) {
            if (!$transaction->reference) {
                $transaction->reference = strtoupper(
                    ($transaction->provider ?? 'TX') . '_' .
                    Str::random(12) . '_' .
                    time()
                );
            }
        });
    }

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
     * Get the associated remittance if any.
     */
    public function remittance()
    {
        return $this->belongsTo(Remittance::class);
    }

    /**
     * Scope a query to only include transactions of a certain type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
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

    /**
     * Determine if this transaction is outgoing from the user's perspective
     * @return bool
     */
    public function isOutgoing()
    {
        $user = auth()->user();
        if (!$user || !$user->wallet) {
            return false;
        }

        // If this is a test transaction created by the user, consider it outgoing
        if ($this->type === 'test' && $this->user_id === $user->id) {
            return true;
        }

        // If the sender address matches the user's wallet public key, it's outgoing
        return $this->sender_address === $user->wallet->public_key;
    }

    /**
     * Determine if this transaction is incoming to the user's perspective
     * @return bool
     */
    public function isIncoming()
    {
        $user = auth()->user();
        if (!$user || !$user->wallet) {
            return false;
        }

        // If this is a test transaction created by the user, it's not incoming
        if ($this->type === 'test' && $this->user_id === $user->id) {
            return false;
        }

        // If the recipient address matches the user's wallet public key, it's incoming
        return $this->recipient_address === $user->wallet->public_key;
    }

    /**
     * Get the transaction direction (incoming/outgoing) from user's perspective
     * @return string
     */
    public function getDirectionAttribute()
    {
        if ($this->isOutgoing()) {
            return 'outgoing';
        } elseif ($this->isIncoming()) {
            return 'incoming';
        }

        // Default to outgoing if user_id matches (for backward compatibility)
        return $this->user_id === auth()->id() ? 'outgoing' : 'incoming';
    }
}
