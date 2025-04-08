<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Remittance;

class NewRemittanceNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $remittance;

    /**
     * Create a new notification instance.
     */
    public function __construct(Remittance $remittance)
    {
        $this->remittance = $remittance;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Remittance Request')
            ->line('A new remittance request has been received.')
            ->line('Amount: ' . $this->remittance->amount . ' ' . $this->remittance->currency)
            ->line('Reference: ' . $this->remittance->reference)
            ->line('Bank Code: ' . $this->remittance->bank_code)
            ->line('Account Number: ' . $this->remittance->account_number)
            ->line('Phone: ' . $this->remittance->phone)
            ->action('View Remittance', url('/admin/remittances/' . $this->remittance->id))
            ->line('Please process this remittance request as soon as possible.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'remittance_id' => $this->remittance->id,
            'amount' => $this->remittance->amount,
            'currency' => $this->remittance->currency,
            'reference' => $this->remittance->reference,
            'bank_code' => $this->remittance->bank_code,
            'account_number' => $this->remittance->account_number,
            'phone' => $this->remittance->phone,
            'user_id' => $this->remittance->user_id,
            'user_name' => $this->remittance->user->name,
        ];
    }
}
