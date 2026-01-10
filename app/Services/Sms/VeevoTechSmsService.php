<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VeevoTechSmsService implements SmsServiceInterface
{
    protected string $apiKey;
    protected string $senderId;
    protected string $baseUrl = 'https://api.veevotech.com/v3/sendsms';

    public function __construct()
    {
        $this->apiKey = config('services.veevotech.api_key') ?? '';
        $this->senderId = config('services.veevotech.sender_id') ?? 'Default';
    }

    /**
     * Send an SMS to a receiver.
     *
     * @param string $receiverNumber
     * @param string $message
     * @return bool
     */
    public function sendSms(string $receiverNumber, string $message): bool
    {
        if (empty($this->apiKey)) {
            Log::error('VeevoTech API key is missing.');
            return false;
        }

        try {
            $response = Http::get($this->baseUrl, [
                'hash' => $this->apiKey,
                'receivernum' => $receiverNumber,
                'sendernum' => $this->senderId,
                'textmessage' => $message,
                // receivernetwork is optional, omitting it.
            ]);

            if ($response->successful()) {
                Log::info('VeevoTech SMS sent successfully', [
                    'receiver' => $receiverNumber,
                    'response' => $response->body()
                ]);
                return true;
            } else {
                Log::error('VeevoTech SMS failed', [
                    'receiver' => $receiverNumber,
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return false;
            }
        } catch (\Exception $e) {
            Log::error('VeevoTech SMS exception', [
                'receiver' => $receiverNumber,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
