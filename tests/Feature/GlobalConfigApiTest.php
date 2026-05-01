<?php

it('returns the global config including android version from config', function () {
    config()->set('app.android_version', '2.3.0');

    $response = $this->getJson('/api/config');

    $response->assertSuccessful()
        ->assertJson([
            'data' => [
                'android_version' => '2.3.0',
            ],
            'message' => 'Global config fetched successfully.',
        ]);
});
