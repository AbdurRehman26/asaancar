<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class GoogleAddressComponentLookupService
{
    /**
     * @param  array{address: string, place_id: string|null}  $payload
     * @return array{
     *     query: string,
     *     place_id: string|null,
     *     formatted_address: string|null,
     *     latitude: float|null,
     *     longitude: float|null,
     *     components: array<string, string|null>,
     *     address_components: array<int, array{long_name: string, short_name: string, types: array<int, string>}>
     * }
     */
    public function lookup(array $payload): array
    {
        $apiKey = config('services.google_maps.api_key');

        if (! filled($apiKey)) {
            throw new RuntimeException('Google Maps API key is not configured.');
        }

        $query = trim($payload['address']);
        $placeId = $payload['place_id'] ?: null;

        if ($query === '' && $placeId === null) {
            throw new RuntimeException('An address or place ID is required.');
        }

        $response = Http::timeout(15)->get('https://maps.googleapis.com/maps/api/geocode/json', [
            'key' => $apiKey,
            'place_id' => $placeId,
            'address' => $placeId ? null : $query,
        ]);

        $response->throw();

        /** @var array{status?: string, results?: array<int, array<string, mixed>>, error_message?: string} $data */
        $data = $response->json();

        if (($data['status'] ?? null) !== 'OK' || empty($data['results'][0])) {
            $message = $data['error_message'] ?? 'Google did not return a matching address result.';

            throw new RuntimeException($message);
        }

        /** @var array<string, mixed> $result */
        $result = $data['results'][0];
        /** @var array<int, array{long_name: string, short_name: string, types: array<int, string>}> $addressComponents */
        $addressComponents = $result['address_components'] ?? [];
        /** @var array{lat?: float, lng?: float}|null $location */
        $location = $result['geometry']['location'] ?? null;

        return [
            'query' => $query,
            'place_id' => $result['place_id'] ?? $placeId,
            'formatted_address' => $result['formatted_address'] ?? null,
            'latitude' => isset($location['lat']) ? (float) $location['lat'] : null,
            'longitude' => isset($location['lng']) ? (float) $location['lng'] : null,
            'components' => [
                'street_number' => $this->componentValue($addressComponents, 'street_number'),
                'route' => $this->componentValue($addressComponents, 'route'),
                'neighborhood' => $this->resolveNeighborhood($addressComponents),
                'sublocality' => $this->componentValue($addressComponents, 'sublocality') ?? $this->componentValue($addressComponents, 'sublocality_level_1'),
                'city' => $this->componentValue($addressComponents, 'locality') ?? $this->componentValue($addressComponents, 'postal_town'),
                'state' => $this->componentValue($addressComponents, 'administrative_area_level_1'),
                'country' => $this->componentValue($addressComponents, 'country'),
                'postal_code' => $this->componentValue($addressComponents, 'postal_code'),
            ],
            'address_components' => $addressComponents,
        ];
    }

    /**
     * @param  array<int, array{long_name: string, short_name: string, types: array<int, string>}>  $components
     */
    protected function componentValue(array $components, string $type): ?string
    {
        foreach ($components as $component) {
            if (in_array($type, $component['types'], true)) {
                return $component['long_name'];
            }
        }

        return null;
    }

    /**
     * @param  array<int, array{long_name: string, short_name: string, types: array<int, string>}>  $components
     */
    protected function resolveNeighborhood(array $components): ?string
    {
        $neighborhood = null;

        foreach ($components as $component) {
            $types = $component['types'];

            if (in_array('neighborhood', $types, true)) {
                return $component['long_name'];
            }

            if (in_array('sublocality_level_1', $types, true)) {
                $neighborhood = $component['long_name'];
            }

            if (! $neighborhood && in_array('sublocality', $types, true)) {
                $neighborhood = $component['long_name'];
            }
        }

        return $neighborhood;
    }
}
