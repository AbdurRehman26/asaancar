<?php

namespace App\Services\Sms;

use InvalidArgumentException;

class SmsSendingService
{
    protected SmsServiceInterface $provider;

    /**
     * SmsSendingService constructor.
     * @param string|null $driver
     */
    public function __construct(?string $driver = null)
    {
        // Default to 'veevotech' if not specified.
        // In a real app, we might pull this from a specific sms config.
        $driver = $driver ?? 'veevotech';

        $this->provider = $this->resolveProvider($driver);
    }

    protected function resolveProvider(string $driver): SmsServiceInterface
    {
        return match ($driver) {
            'veevotech' => new VeevoTechSmsService(),
            default => throw new InvalidArgumentException("SMS driver verification failed: {$driver}"),
        };
    }

    /**
     * Send an SMS via the selected provider.
     *
     * @param string $receiverNumber
     * @param string $message
     * @return bool
     */
    public function send(string $receiverNumber, string $message): bool
    {
        return $this->provider->sendSms($receiverNumber, $message);
    }
}
