<?php

afterEach(function () {
    putenv('APP_ENV');
    putenv('BOOST_ENABLED');
    putenv('BOOST_BROWSER_LOGS_WATCHER');
    unset($_ENV['APP_ENV'], $_ENV['BOOST_ENABLED'], $_ENV['BOOST_BROWSER_LOGS_WATCHER']);
    unset($_SERVER['APP_ENV'], $_SERVER['BOOST_ENABLED'], $_SERVER['BOOST_BROWSER_LOGS_WATCHER']);
});

it('enables boost by default in local environment', function () {
    putenv('APP_ENV=local');
    $_ENV['APP_ENV'] = 'local';
    $_SERVER['APP_ENV'] = 'local';

    $config = require __DIR__.'/../../config/boost.php';

    expect($config['enabled'])->toBeTrue()
        ->and($config['browser_logs_watcher'])->toBeTrue();
});

it('disables boost by default outside local environment', function () {
    putenv('APP_ENV=production');
    $_ENV['APP_ENV'] = 'production';
    $_SERVER['APP_ENV'] = 'production';

    $config = require __DIR__.'/../../config/boost.php';

    expect($config['enabled'])->toBeFalse()
        ->and($config['browser_logs_watcher'])->toBeFalse();
});

it('allows explicit boost override outside local environment', function () {
    putenv('APP_ENV=production');
    putenv('BOOST_ENABLED=true');
    putenv('BOOST_BROWSER_LOGS_WATCHER=true');
    $_ENV['APP_ENV'] = 'production';
    $_ENV['BOOST_ENABLED'] = 'true';
    $_ENV['BOOST_BROWSER_LOGS_WATCHER'] = 'true';
    $_SERVER['APP_ENV'] = 'production';
    $_SERVER['BOOST_ENABLED'] = 'true';
    $_SERVER['BOOST_BROWSER_LOGS_WATCHER'] = 'true';

    $config = require __DIR__.'/../../config/boost.php';

    expect($config['enabled'])->toBeTrue()
        ->and($config['browser_logs_watcher'])->toBeTrue();
});
