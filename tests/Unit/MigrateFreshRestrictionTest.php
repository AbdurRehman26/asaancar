<?php

use App\Providers\AppServiceProvider;
use Illuminate\Database\Console\Migrations\FreshCommand;
use Illuminate\Foundation\Application;

beforeEach(function () {
    FreshCommand::prohibit(false);
});

afterEach(function () {
    FreshCommand::prohibit(false);
});

it('prohibits migrate fresh outside local and testing environments', function () {
    $application = new Application(dirname(__DIR__, 2));
    $application->detectEnvironment(fn (): string => 'production');

    (new AppServiceProvider($application))->boot();

    $reflection = new ReflectionClass(FreshCommand::class);
    $property = $reflection->getProperty('prohibitedFromRunning');
    $property->setAccessible(true);

    expect($property->getValue())->toBeTrue();
});

it('allows migrate fresh in the testing environment', function () {
    $application = new Application(dirname(__DIR__, 2));
    $application->detectEnvironment(fn (): string => 'testing');

    (new AppServiceProvider($application))->boot();

    $reflection = new ReflectionClass(FreshCommand::class);
    $property = $reflection->getProperty('prohibitedFromRunning');
    $property->setAccessible(true);

    expect($property->getValue())->toBeFalse();
});
