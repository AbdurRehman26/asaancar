<?php

it('includes the phone number column in the admin users table', function () {
    $resourceContents = file_get_contents(__DIR__.'/../../app/Filament/Resources/UserResource.php');

    expect($resourceContents)->toContain("TextColumn::make('phone_number')");
});

it('includes the driver indicator column in the admin users table', function () {
    $resourceContents = file_get_contents(__DIR__.'/../../app/Filament/Resources/UserResource.php');

    expect($resourceContents)
        ->toContain("IconColumn::make('is_driver')")
        ->toContain("hasRole('driver')");
});
