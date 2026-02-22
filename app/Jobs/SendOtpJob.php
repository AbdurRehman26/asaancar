<?php

namespace App\Jobs;

use App\Services\Sms\SmsSendingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendOtpJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 60;

    public function __construct(
        public string $phoneNumber,
        public string $otp,
        public ?int $userId = null,
        public bool $isSignup = false,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $message = "Your AsaanCar verification code is: {$this->otp}";

            $smsService = new SmsSendingService;
            $sent = $smsService->send($this->phoneNumber, $message);

            if (! $sent) {
                throw new \Exception("Failed to send SMS to {$this->phoneNumber}");
            }

            Log::info('OTP SMS sent successfully via job', [
                'phone_number' => $this->phoneNumber,
                'is_signup' => $this->isSignup,
                'user_id' => $this->userId,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send OTP SMS via job', [
                'phone_number' => $this->phoneNumber,
                'error' => $e->getMessage(),
            ]);

            throw $e; // Re-throw to trigger retry
        }
    }
}
