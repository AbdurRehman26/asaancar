<?php

use App\Services\GoogleAddressComponentLookupService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class);

it('maps google geocoding components into a simplified address structure', function () {
    Config::set('services.google_maps.api_key', 'test-key');

    Http::fake([
        'https://maps.googleapis.com/maps/api/geocode/json*' => Http::response([
            'status' => 'OK',
            'results' => [[
                'place_id' => 'place-123',
                'formatted_address' => 'DHA Phase 8, Karachi, Sindh, Pakistan',
                'geometry' => [
                    'location' => [
                        'lat' => 24.8138,
                        'lng' => 67.0332,
                    ],
                ],
                'address_components' => [
                    [
                        'long_name' => '8',
                        'short_name' => '8',
                        'types' => ['street_number'],
                    ],
                    [
                        'long_name' => 'Khayaban-e-Ittehad',
                        'short_name' => 'Khayaban-e-Ittehad',
                        'types' => ['route'],
                    ],
                    [
                        'long_name' => 'Creek Vista',
                        'short_name' => 'Creek Vista',
                        'types' => ['neighborhood', 'political'],
                    ],
                    [
                        'long_name' => 'DHA Phase 8',
                        'short_name' => 'DHA Phase 8',
                        'types' => ['sublocality', 'political'],
                    ],
                    [
                        'long_name' => 'Karachi',
                        'short_name' => 'Karachi',
                        'types' => ['locality', 'political'],
                    ],
                    [
                        'long_name' => 'Sindh',
                        'short_name' => 'Sindh',
                        'types' => ['administrative_area_level_1', 'political'],
                    ],
                    [
                        'long_name' => 'Pakistan',
                        'short_name' => 'PK',
                        'types' => ['country', 'political'],
                    ],
                    [
                        'long_name' => '75500',
                        'short_name' => '75500',
                        'types' => ['postal_code'],
                    ],
                ],
            ]],
        ]),
    ]);

    $result = app(GoogleAddressComponentLookupService::class)->lookup([
        'address' => 'DHA Phase 8',
        'place_id' => 'place-123',
    ]);

    expect($result['place_id'])->toBe('place-123')
        ->and($result['formatted_address'])->toBe('DHA Phase 8, Karachi, Sindh, Pakistan')
        ->and($result['components']['neighborhood'])->toBe('Creek Vista')
        ->and($result['components']['city'])->toBe('Karachi')
        ->and($result['components']['state'])->toBe('Sindh')
        ->and($result['components']['country'])->toBe('Pakistan')
        ->and($result['components']['postal_code'])->toBe('75500')
        ->and($result['latitude'])->toBe(24.8138)
        ->and($result['longitude'])->toBe(67.0332);
});

it('falls back from neighborhood to sublocality level 1 and then sublocality', function () {
    Config::set('services.google_maps.api_key', 'test-key');

    Http::fake([
        'https://maps.googleapis.com/maps/api/geocode/json*' => Http::response([
            'status' => 'OK',
            'results' => [[
                'place_id' => 'place-456',
                'formatted_address' => 'Test Address',
                'geometry' => [
                    'location' => [
                        'lat' => 24.0,
                        'lng' => 67.0,
                    ],
                ],
                'address_components' => [
                    [
                        'long_name' => 'Fallback Sublocality Level 1',
                        'short_name' => 'Fallback Sublocality Level 1',
                        'types' => ['sublocality_level_1', 'sublocality', 'political'],
                    ],
                    [
                        'long_name' => 'Fallback Sublocality',
                        'short_name' => 'Fallback Sublocality',
                        'types' => ['sublocality', 'political'],
                    ],
                ],
            ]],
        ]),
    ]);

    $result = app(GoogleAddressComponentLookupService::class)->lookup([
        'address' => 'Test Address',
        'place_id' => null,
    ]);

    expect($result['components']['neighborhood'])->toBe('Fallback Sublocality Level 1');
});

it('throws a clear exception when google maps api key is missing', function () {
    Config::set('services.google_maps.api_key', null);

    expect(fn () => app(GoogleAddressComponentLookupService::class)->lookup([
        'address' => 'Karachi',
        'place_id' => null,
    ]))->toThrow(RuntimeException::class, 'Google Maps API key is not configured.');
});
