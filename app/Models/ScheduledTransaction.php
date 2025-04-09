<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduledTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_ids',
        'schedule_type',
        'next_execution',
        'last_executed_at',
        'is_active',
        'is_recurring',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'transaction_ids' => 'array',
        'next_execution' => 'datetime',
        'last_executed_at' => 'datetime',
        'is_active' => 'boolean',
        'is_recurring' => 'boolean',
    ];

    /**
     * Get the user that created this scheduled transaction.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the transactions associated with this schedule
     */
    public function transactions()
    {
        return Transaction::whereIn('id', $this->transaction_ids)->get();
    }

    /**
     * Check if the schedule is due for execution
     */
    public function isDue(): bool
    {
        return $this->is_active && $this->next_execution <= now();
    }

    /**
     * Update the next execution time based on schedule type
     */
    public function updateNextExecution(): void
    {
        if (!$this->is_recurring) {
            $this->is_active = false;
            $this->save();
            return;
        }

        $this->last_executed_at = now();

        switch ($this->schedule_type) {
            case 'hourly':
                $this->next_execution = now()->addHour();
                break;
            case 'daily':
                $this->next_execution = now()->addDay();
                break;
            case 'weekly':
                $this->next_execution = now()->addWeek();
                break;
            default:
                $this->next_execution = now()->addDay();
        }

        $this->save();
    }
}
