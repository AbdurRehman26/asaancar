<?php

namespace App\Services;

class LiveRideEstimator
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function estimate(array $payload): array
    {
        $distanceKm = $this->haversineDistance(
            (float) $payload['pickup_latitude'],
            (float) $payload['pickup_longitude'],
            (float) $payload['dropoff_latitude'],
            (float) $payload['dropoff_longitude'],
        );

        $vehicleMultiplier = match ($payload['vehicle_type'] ?? null) {
            'bike' => 0.70,
            'go' => 1.20,
            'xl' => 1.55,
            default => 1.0,
        };

        $etaMinutes = max(3, (int) ceil(($distanceKm / 28) * 60));
        $estimatedFare = max(180, round((120 + ($distanceKm * 48) + ($etaMinutes * 7)) * $vehicleMultiplier, 2));

        return [
            'estimated_fare' => $estimatedFare,
            'distance_km' => round($distanceKm, 2),
            'eta_minutes' => $etaMinutes,
            'currency' => 'PKR',
        ];
    }

    private function haversineDistance(float $startLatitude, float $startLongitude, float $endLatitude, float $endLongitude): float
    {
        $earthRadiusKm = 6371;
        $latitudeDelta = deg2rad($endLatitude - $startLatitude);
        $longitudeDelta = deg2rad($endLongitude - $startLongitude);

        $a = sin($latitudeDelta / 2) ** 2
            + cos(deg2rad($startLatitude)) * cos(deg2rad($endLatitude))
            * sin($longitudeDelta / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadiusKm * $c;
    }
}
