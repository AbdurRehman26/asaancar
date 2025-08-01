<?php

return [

    'paths' => [
        'api/*', // ✅ Needed for API routes
        'broadcasting/auth', // ✅ Needed for Laravel Echo & Sanctum
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // ✅ Required if using Sanctum with cookies
];
