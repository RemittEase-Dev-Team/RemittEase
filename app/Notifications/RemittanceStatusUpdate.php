<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Remittance;

class RemittanceStatusUpdate extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The remittance instance.
     *
     * @var \App\Models\Remittance
     */
    protected $remittance;

    /**
     * Create a new notification instance.
     *
     * @param \App\Models\Remittance $remittance
     * @return void
     */
    public function __construct(Remittance $remittance)
    {
        $this->remittance = $remittance;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param mixed $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $statusText = ucfirst($this->remittance->status);
        $message = "Remittance #{$this->remittance->id} status has been updated to {$statusText}";

        if ($this->remittance->status === 'failed') {
            $message .= ". Reason: " . ($this->remittance->failure_reason ?? 'Unknown');
        }

        return (new MailMessage)
            ->subject("Remittance Status Update - #{$this->remittance->id}")
            ->greeting("Hello Admin,")
            ->line($message)
            ->line("Amount: {$this->remittance->currency} {$this->remittance->amount}")
            ->line("Recipient: {$this->remittance->account_number}")
            ->line("Reference: {$this->remittance->reference}")
            ->action('View Details', url('/admin/remittances/' . $this->remittance->id))
            ->line('Please process this remittance accordingly.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'id' => $this->remittance->id,
            'status' => $this->remittance->status,
            'amount' => $this->remittance->amount,
            'currency' => $this->remittance->currency,
            'reference' => $this->remittance->reference,
            'message' => "Remittance #{$this->remittance->id} status updated to " . ucfirst($this->remittance->status),
            'failure_reason' => $this->remittance->failure_reason,
        ];
    }
}
