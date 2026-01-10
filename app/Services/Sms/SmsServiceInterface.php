<?php

namespace App\Services\Sms;

interface SmsServiceInterface
{
    /**
     * Send an SMS to a receiver.
     *
     * @param string $receiverNumber
     * @param string $message
     * @return bool
     */
    public function sendSms(string $receiverNumber, string $message): bool;
}
