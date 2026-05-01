<?php

namespace App\Services;

use App\Events\LiveRideRequested;
use App\Models\DriverAvailability;
use App\Models\LiveRideRequest;
use App\Models\RideDispatchEvent;
use Illuminate\Support\Collection;

class LiveRideDispatcher
{
    /**
     * @return Collection<int, DriverAvailability>
     */
    public function eligibleDriversForRide(LiveRideRequest $liveRideRequest, int $limit = 15): Collection
    {
        $activeDriverIds = LiveRideRequest::query()
            ->whereIn('status', LiveRideRequest::ACTIVE_STATUSES)
            ->whereNotNull('driver_user_id')
            ->pluck('driver_user_id');

        $rejectedDriverIds = $liveRideRequest->rejections()->pluck('driver_user_id');

        $query = DriverAvailability::query()
            ->select('driver_availability.*')
            ->join('driver_locations', 'driver_locations.driver_user_id', '=', 'driver_availability.driver_user_id')
            ->with(['driver', 'driverLocation'])
            ->where('driver_availability.is_online', true)
            ->where('driver_availability.is_available', true)
            ->where('driver_availability.driver_user_id', '!=', $liveRideRequest->rider_user_id)
            ->whereNotIn('driver_availability.driver_user_id', $activeDriverIds)
            ->whereNotIn('driver_availability.driver_user_id', $rejectedDriverIds);

        if ($liveRideRequest->vehicle_type) {
            $query->where(function ($driverQuery) use ($liveRideRequest) {
                $driverQuery
                    ->where('driver_availability.vehicle_type', $liveRideRequest->vehicle_type)
                    ->orWhereNull('driver_availability.vehicle_type');
            });
        }

        $query->selectRaw(
            '(
                6371 * ACOS(
                    COS(RADIANS(?)) * COS(RADIANS(driver_locations.latitude))
                    * COS(RADIANS(driver_locations.longitude) - RADIANS(?))
                    + SIN(RADIANS(?)) * SIN(RADIANS(driver_locations.latitude))
                )
            ) AS distance_km',
            [
                (float) $liveRideRequest->pickup_latitude,
                (float) $liveRideRequest->pickup_longitude,
                (float) $liveRideRequest->pickup_latitude,
            ],
        )->orderBy('distance_km')
            ->limit($limit);

        return $query->get()->filter(function (DriverAvailability $driverAvailability) {
            return isset($driverAvailability->distance_km) && (float) $driverAvailability->distance_km <= 20;
        })->values();
    }

    /**
     * @return Collection<int, DriverAvailability>
     */
    public function dispatch(LiveRideRequest $liveRideRequest): Collection
    {
        $eligibleDrivers = $this->eligibleDriversForRide($liveRideRequest);

        foreach ($eligibleDrivers as $driverAvailability) {
            RideDispatchEvent::query()->create([
                'live_ride_request_id' => $liveRideRequest->id,
                'event_type' => 'request_broadcasted',
                'actor_user_id' => null,
                'payload' => [
                    'driver_user_id' => $driverAvailability->driver_user_id,
                    'distance_km' => isset($driverAvailability->distance_km) ? round((float) $driverAvailability->distance_km, 2) : null,
                ],
                'occurred_at' => now(),
            ]);

            broadcast(new LiveRideRequested($liveRideRequest, $driverAvailability->driver_user_id))->toOthers();
        }

        return $eligibleDrivers;
    }

    /**
     * @return Collection<int, LiveRideRequest>
     */
    public function incomingForDriver(int $driverUserId): Collection
    {
        $driverAvailability = DriverAvailability::query()
            ->with('driverLocation')
            ->where('driver_user_id', $driverUserId)
            ->first();

        if (! $driverAvailability || ! $driverAvailability->is_online || ! $driverAvailability->is_available || ! $driverAvailability->driverLocation) {
            return collect();
        }

        $hasActiveRide = LiveRideRequest::query()
            ->where('driver_user_id', $driverUserId)
            ->whereIn('status', LiveRideRequest::ACTIVE_STATUSES)
            ->exists();

        if ($hasActiveRide) {
            return collect();
        }

        return LiveRideRequest::query()
            ->with(['rider', 'driver', 'latestDriverLocation'])
            ->where('status', LiveRideRequest::STATUS_SEARCHING)
            ->whereDoesntHave('rejections', fn ($query) => $query->where('driver_user_id', $driverUserId))
            ->when($driverAvailability->vehicle_type, function ($query) use ($driverAvailability) {
                $query->where(function ($vehicleQuery) use ($driverAvailability) {
                    $vehicleQuery
                        ->where('vehicle_type', $driverAvailability->vehicle_type)
                        ->orWhereNull('vehicle_type');
                });
            })
            ->orderByDesc('requested_at')
            ->limit(10)
            ->get()
            ->filter(function (LiveRideRequest $liveRideRequest) use ($driverAvailability) {
                return $this->distanceBetween(
                    (float) $driverAvailability->driverLocation->latitude,
                    (float) $driverAvailability->driverLocation->longitude,
                    (float) $liveRideRequest->pickup_latitude,
                    (float) $liveRideRequest->pickup_longitude,
                ) <= 20;
            })
            ->values();
    }

    private function distanceBetween(float $startLatitude, float $startLongitude, float $endLatitude, float $endLongitude): float
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
