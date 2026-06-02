<?php

namespace App\Services;

use App\Models\City;
use App\Models\PickAndDrop;
use App\Models\PickAndDropStop;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class AdminPickAndDropTestingService
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array{message: string, data: PickAndDrop}
     */
    public function execute(array $payload, GoogleAddressComponentLookupService $lookupService): array
    {
        $validator = Validator::make($payload, [
            'user_id' => 'nullable|integer|exists:users,id|required_without:user',
            'user' => 'nullable|array|required_without:user_id',
            'user.name' => 'required_with:user|string|max:255',
            'user.phone_number' => 'required_with:user|string|max:255',
            'user.gender' => 'nullable|in:male,female',
            'user.city' => 'nullable|string|max:255',
            'user.city_id' => 'nullable|integer|exists:cities,id',
            'car_id' => 'nullable',
            'start_location' => 'required|string|max:255',
            'end_location' => 'nullable|string|max:255',
            'start_place_id' => 'nullable|string|max:255',
            'end_place_id' => 'nullable|string|max:255',
            'pickup_city_id' => 'nullable|integer|exists:cities,id',
            'dropoff_city_id' => 'nullable|integer|exists:cities,id',
            'available_spaces' => 'required|integer|min:1',
            'driver_gender' => 'required|in:male,female',
            'departure_time' => 'required|date_format:Y-m-d H:i:s',
            'price_per_person' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'is_active' => 'required|boolean',
            'schedule_type' => 'required|in:once,everyday,weekdays,weekends,custom',
            'stops' => 'sometimes|array',
            'stops.*.location' => 'required_with:stops|string|max:255',
            'stops.*.stop_area' => 'nullable|string|max:255',
            'stops.*.place_id' => 'nullable|string|max:255',
            'stops.*.latitude' => 'nullable|numeric',
            'stops.*.longitude' => 'nullable|numeric',
            'stops.*.city_id' => 'nullable|integer|exists:cities,id',
            'stops.*.area_id' => 'nullable|integer|exists:areas,id',
            'stops.*.stop_time' => 'required_with:stops|date',
            'stops.*.order' => 'required_with:stops|integer|min:0',
            'stops.*.notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        $userId = $this->resolveUserId($payload);
        $payload = $this->enrichPayloadFromGoogle($payload, $lookupService);

        $pickAndDrop = PickAndDrop::create([
            'user_id' => $userId,
            'car_id' => null,
            'start_location' => $payload['start_location'],
            'start_place_id' => $payload['start_place_id'] ?? null,
            'start_latitude' => $payload['start_latitude'] ?? null,
            'start_longitude' => $payload['start_longitude'] ?? null,
            'end_location' => $payload['end_location'] ?? null,
            'end_place_id' => $payload['end_place_id'] ?? null,
            'end_latitude' => $payload['end_latitude'] ?? null,
            'end_longitude' => $payload['end_longitude'] ?? null,
            'pickup_city_id' => $payload['pickup_city_id'],
            'dropoff_city_id' => $payload['dropoff_city_id'] ?? null,
            'pickup_area_id' => $payload['pickup_area_id'] ?? null,
            'dropoff_area_id' => $payload['dropoff_area_id'] ?? null,
            'available_spaces' => $payload['available_spaces'],
            'driver_gender' => $payload['driver_gender'],
            'car_brand' => $payload['car_brand'] ?? null,
            'car_model' => $payload['car_model'] ?? null,
            'car_color' => $payload['car_color'] ?? null,
            'car_seats' => $payload['car_seats'] ?? null,
            'car_transmission' => $payload['car_transmission'] ?? null,
            'car_fuel_type' => $payload['car_fuel_type'] ?? null,
            'departure_time' => $payload['departure_time'],
            'return_time' => $payload['return_time'] ?? null,
            'description' => $payload['description'] ?? null,
            'price_per_person' => $payload['price_per_person'],
            'currency' => $payload['currency'],
            'is_active' => $payload['is_active'],
            'is_roundtrip' => $payload['is_roundtrip'] ?? false,
            'schedule_type' => $payload['schedule_type'],
            'selected_days' => isset($payload['selected_days']) ? json_encode($payload['selected_days']) : null,
        ]);

        foreach ($payload['stops'] ?? [] as $stop) {
            PickAndDropStop::create([
                'pick_and_drop_service_id' => $pickAndDrop->id,
                'location' => $stop['location'] ?? null,
                'stop_area' => $stop['stop_area'] ?? null,
                'place_id' => $stop['place_id'] ?? null,
                'latitude' => $stop['latitude'] ?? null,
                'longitude' => $stop['longitude'] ?? null,
                'city_id' => $stop['city_id'] ?? null,
                'area_id' => $stop['area_id'] ?? null,
                'stop_time' => $stop['stop_time'],
                'order' => $stop['order'] ?? 0,
                'notes' => $stop['notes'] ?? null,
            ]);
        }

        return [
            'message' => 'Pick & Drop service created successfully',
            'data' => $pickAndDrop->fresh()->load(['user.city', 'pickupCity', 'dropoffCity', 'stops.city', 'stops.area']),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function template(): array
    {
        return [
            'user' => [
                'name' => 'Test Driver',
                'phone_number' => '+923001234567',
                'gender' => 'male',
                'city' => 'Karachi',
            ],
            'user_id' => null,
            'car_id' => null,
            'start_location' => 'Karachi Airport',
            'end_location' => 'Clifton Beach',
            'start_place_id' => null,
            'end_place_id' => null,
            'pickup_city_id' => null,
            'dropoff_city_id' => null,
            'pickup_area_id' => null,
            'dropoff_area_id' => null,
            'available_spaces' => 4,
            'driver_gender' => 'male',
            'car_brand' => 'Toyota',
            'car_model' => 'Corolla',
            'car_color' => 'White',
            'car_seats' => 5,
            'car_transmission' => 'automatic',
            'car_fuel_type' => 'petrol',
            'departure_time' => '2024-12-20 10:00:00',
            'return_time' => '18:00:00',
            'description' => 'Comfortable ride with AC',
            'price_per_person' => 500,
            'currency' => 'PKR',
            'is_active' => true,
            'is_roundtrip' => false,
            'schedule_type' => 'once',
            'selected_days' => [],
            'stops' => [
                [
                    'location' => 'Shahrah-e-Faisal',
                    'stop_area' => 'PECHS',
                    'place_id' => null,
                    'latitude' => null,
                    'longitude' => null,
                    'city_id' => null,
                    'area_id' => null,
                    'stop_time' => '2024-12-20 10:20:00',
                    'order' => 0,
                    'notes' => 'Optional pickup stop',
                ],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function resolveUserId(array $payload): int
    {
        if (isset($payload['user_id']) && filled($payload['user_id'])) {
            return (int) $payload['user_id'];
        }

        /** @var array{name: string, phone_number: string, gender?: string|null, city?: string|null, city_id?: int|null} $userPayload */
        $userPayload = $payload['user'];
        $normalizedPhoneNumber = $this->normalizePakistanPhoneNumber($userPayload['phone_number']);

        $cityId = $this->resolveCityId(
            cityId: isset($userPayload['city_id']) ? (int) $userPayload['city_id'] : null,
            cityName: $userPayload['city'] ?? null,
        );

        $user = User::query()->firstOrNew([
            'phone_number' => $normalizedPhoneNumber,
        ]);

        $user->forceFill([
            'name' => $userPayload['name'],
            'phone_number' => $normalizedPhoneNumber,
            'gender' => $userPayload['gender'] ?? $user->gender,
            'city_id' => $cityId,
            'is_verified' => $user->exists ? $user->is_verified : true,
        ])->save();

        return (int) $user->id;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function enrichPayloadFromGoogle(array $payload, GoogleAddressComponentLookupService $lookupService): array
    {
        $startResult = $this->lookupLocation(
            lookupService: $lookupService,
            location: (string) $payload['start_location'],
            placeId: $payload['start_place_id'] ?? null,
            label: 'start',
        );

        $payload['start_place_id'] = $startResult['place_id'];
        $payload['start_latitude'] = $startResult['latitude'];
        $payload['start_longitude'] = $startResult['longitude'];
        $payload['pickup_city_id'] = $payload['pickup_city_id'] ?? $this->resolveCityId(cityName: $startResult['components']['city'] ?? null);

        if (filled($payload['end_location'] ?? null) || filled($payload['end_place_id'] ?? null)) {
            $endResult = $this->lookupLocation(
                lookupService: $lookupService,
                location: (string) ($payload['end_location'] ?? ''),
                placeId: $payload['end_place_id'] ?? null,
                label: 'end',
            );

            $payload['end_place_id'] = $endResult['place_id'];
            $payload['end_latitude'] = $endResult['latitude'];
            $payload['end_longitude'] = $endResult['longitude'];
            $payload['dropoff_city_id'] = $payload['dropoff_city_id'] ?? $this->resolveCityId(cityName: $endResult['components']['city'] ?? null);
        }

        return $payload;
    }

    /**
     * @return array{
     *     place_id: string|null,
     *     latitude: float|null,
     *     longitude: float|null,
     *     components: array<string, string|null>
     * }
     */
    private function lookupLocation(
        GoogleAddressComponentLookupService $lookupService,
        string $location,
        mixed $placeId,
        string $label,
    ): array {
        try {
            return $lookupService->lookup([
                'address' => $location,
                'place_id' => filled($placeId) ? (string) $placeId : null,
            ]);
        } catch (RuntimeException $exception) {
            return [
                'query' => $location,
                'place_id' => filled($placeId) ? (string) $placeId : null,
                'formatted_address' => $location !== '' ? $location : null,
                'latitude' => null,
                'longitude' => null,
                'components' => [],
                'address_components' => [],
            ];
        }
    }

    private function resolveCityId(?int $cityId = null, ?string $cityName = null): ?int
    {
        if ($cityId) {
            return $cityId;
        }

        $normalizedCityName = trim((string) $cityName);

        if ($normalizedCityName === '') {
            return null;
        }

        $city = City::query()
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($normalizedCityName)])
            ->first();

        if ($city) {
            return (int) $city->id;
        }

        $city = City::query()->create([
            'name' => $normalizedCityName,
        ]);

        return (int) $city->id;
    }

    private function normalizePakistanPhoneNumber(string $phoneNumber): string
    {
        $digits = preg_replace('/\D+/', '', $phoneNumber) ?? '';

        if ($digits === '') {
            return $phoneNumber;
        }

        if (str_starts_with($digits, '92')) {
            return '+'.$digits;
        }

        if (str_starts_with($digits, '0')) {
            return '+92'.substr($digits, 1);
        }

        return '+92'.$digits;
    }
}
