<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recipient extends Model
{
    use HasFactory;

    protected $table = 'recipients';

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'country',
        'bank_name',
        'account_number',
        'routing_number',
        'swift_code',
        'address',
        'city',
        'state',
        'postal_code',
        'is_verified'
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
