<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OtpNotification extends Notification
{
    use Queueable;

    protected $otp;
    protected $isEmail;

    /**
     * Create a new notification instance.
     */
    public function __construct($otp, $isEmail = true)
    {
        $this->otp = $otp;
        $this->isEmail = $isEmail;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        if ($this->isEmail) {
            return ['mail'];
        }
        // For SMS, Twilio Verify API is handled in the controller
        // This notification is only used for email OTPs now
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your OTP Verification Code')
            ->line('Your OTP verification code is: ' . $this->otp)
            ->line('This code will expire in 10 minutes.')
            ->line('If you did not request this code, please ignore this message.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'otp' => $this->otp,
        ];
    }
}
