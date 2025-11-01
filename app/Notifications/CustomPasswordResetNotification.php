<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;

class CustomPasswordResetNotification extends ResetPassword
{
    use Queueable;

    protected function buildMailMessage($url)
    {
        return (new MailMessage)
            ->subject('Reset Your Password - AsaanCar')
            ->view('emails.reset-password', [
                'url' => $url
            ]);
    }
}

