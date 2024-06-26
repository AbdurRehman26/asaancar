<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'webhook' => [
        'secret' => env('WEBHOOK_SECRET', 'secret'),
    ],

    'telegram_bot' => [
        'username' => env('TELEGRAM_BOT_USERNAME'),
        'token' => env('TELEGRAM_BOT_TOKEN'),
        'api' => 'https://api.telegram.org/bot'.env('TELEGRAM_BOT_TOKEN'),
        'webhook_url' => env('TELEGRAM_BOT_WEBHOOK_UR', env('APP_URL').'/telegram/hook'),
    ],
];
