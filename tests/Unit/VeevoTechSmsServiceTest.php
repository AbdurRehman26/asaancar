<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\Sms\VeevoTechSmsService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;

class VeevoTechSmsServiceTest extends TestCase
{
    public function test_it_can_send_sms_successfully()
    {
        Config::set('services.veevotech.api_key', 'test_key');
        Config::set('services.veevotech.sender_id', 'TestSender');

        Http::fake([
            'api.veevotech.com/*' => Http::response('OK', 200),
        ]);

        $service = new VeevoTechSmsService();
        $result = $service->sendSms('+923001234567', 'Hello Test');

        $this->assertTrue($result);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'api.veevotech.com/v3/sendsms') &&
                   $request['hash'] === 'test_key' &&
                   $request['receivernum'] === '+923001234567' &&
                   $request['sendernum'] === 'TestSender' &&
                   $request['textmessage'] === 'Hello Test';
        });
    }

    public function test_it_returns_false_if_api_fails()
    {
        Config::set('services.veevotech.api_key', 'test_key');

        Http::fake([
            'api.veevotech.com/*' => Http::response('Error', 500),
        ]);

        $service = new VeevoTechSmsService();
        $result = $service->sendSms('+923001234567', 'Hello Test');

        $this->assertFalse($result);
    }

    public function test_it_returns_false_if_api_key_is_missing()
    {
        Config::set('services.veevotech.api_key', null);

        $service = new VeevoTechSmsService();
        $result = $service->sendSms('+923001234567', 'Hello Test');

        $this->assertFalse($result);
    }
}
