<?php

return [
    'enabled' => env('BOOST_ENABLED', env('APP_ENV') === 'local'),

    'browser_logs_watcher' => env('BOOST_BROWSER_LOGS_WATCHER', env('APP_ENV') === 'local'),
];
