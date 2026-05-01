<?php

namespace App\Services;

use App\Events\LiveRideAssigned;
use App\Events\LiveRideCancelled;
use App\Events\LiveRideCompleted;
use App\Events\LiveRideDriverArrived;
use App\Events\LiveRideDriverLocationUpdated;
use App\Events\LiveRideExpired;
use App\Events\LiveRideStarted;
use App\Models\DriverAvailability;
use App\Models\DriverLocation;
use App\Models\LiveRideRequest;
use App\Models\LiveRideRequestRejection;
use App\Models\RideDispatchEvent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LiveRideStateManager
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    public function createRequest(User $rider, array $attributes): LiveRideRequest
    {
        $this->ensureUserHasNoActiveRide($rider->id, 'rider_user_id');

        $liveRideRequest = LiveRideRequest::query()->create([
            'rider_user_id' => $rider->id,
            'status' => LiveRideRequest::STATUS_SEARCHING,
            'pickup_place_id' => $attributes['pickup_place_id'] ?? null,
            'pickup_location' => $attributes['pickup_location'],
            'pickup_latitude' => $attributes['pickup_latitude'],
            'pickup_longitude' => $attributes['pickup_longitude'],
            'dropoff_place_id' => $attributes['dropoff_place_id'] ?? null,
            'dropoff_location' => $attributes['dropoff_location'],
            'dropoff_latitude' => $attributes['dropoff_latitude'],
            'dropoff_longitude' => $attributes['dropoff_longitude'],
            'vehicle_type' => $attributes['vehicle_type'] ?? null,
            'estimated_fare' => $attributes['estimated_fare'],
            'final_fare' => null,
            'distance_km' => $attributes['distance_km'] ?? null,
            'eta_minutes' => $attributes['eta_minutes'] ?? null,
            'currency' => $attributes['currency'] ?? 'PKR',
            'requested_at' => now(),
        ]);

        $this->appendDispatchEvent($liveRideRequest, 'request_created', $rider->id, [
            'vehicle_type' => $liveRideRequest->vehicle_type,
        ]);

        return $liveRideRequest->load(['rider', 'driver', 'latestDriverLocation', 'dispatchEvents.actor']);
    }

    public function accept(LiveRideRequest $liveRideRequest, User $driver): LiveRideRequest
    {
        return DB::transaction(function () use ($liveRideRequest, $driver) {
            /** @var LiveRideRequest $lockedRide */
            $lockedRide = LiveRideRequest::query()->lockForUpdate()->findOrFail($liveRideRequest->id);

            if ($lockedRide->rider_user_id === $driver->id) {
                throw ValidationException::withMessages([
                    'driver' => ['You cannot accept your own ride request.'],
                ]);
            }

            if ($lockedRide->status !== LiveRideRequest::STATUS_SEARCHING || $lockedRide->driver_user_id !== null) {
                throw ValidationException::withMessages([
                    'ride' => ['This live ride has already been assigned.'],
                ]);
            }

            $this->ensureUserHasNoActiveRide($driver->id, 'driver_user_id');

            $lockedRide->forceFill([
                'driver_user_id' => $driver->id,
                'status' => LiveRideRequest::STATUS_DRIVER_ASSIGNED,
                'accepted_at' => now(),
            ])->save();

            DriverAvailability::query()->updateOrCreate(
                ['driver_user_id' => $driver->id],
                [
                    'is_online' => true,
                    'is_available' => false,
                    'last_seen_at' => now(),
                ],
            );

            $this->appendDispatchEvent($lockedRide, 'driver_accepted', $driver->id);

            $lockedRide->load(['rider', 'driver', 'latestDriverLocation', 'dispatchEvents.actor']);

            broadcast(new LiveRideAssigned($lockedRide))->toOthers();

            return $lockedRide;
        });
    }

    public function reject(LiveRideRequest $liveRideRequest, User $driver, ?string $reason = null): LiveRideRequest
    {
        if ($liveRideRequest->status !== LiveRideRequest::STATUS_SEARCHING) {
            throw ValidationException::withMessages([
                'ride' => ['Only searching rides can be rejected.'],
            ]);
        }

        LiveRideRequestRejection::query()->firstOrCreate(
            [
                'live_ride_request_id' => $liveRideRequest->id,
                'driver_user_id' => $driver->id,
            ],
            [
                'rejected_at' => now(),
            ],
        );

        $this->appendDispatchEvent($liveRideRequest, 'driver_rejected', $driver->id, [
            'reason' => $reason,
        ]);

        return $liveRideRequest->load(['rider', 'driver', 'latestDriverLocation', 'dispatchEvents.actor']);
    }

    public function markDriverArrived(LiveRideRequest $liveRideRequest, User $driver): LiveRideRequest
    {
        return $this->transitionDriverRide(
            $liveRideRequest,
            $driver,
            [LiveRideRequest::STATUS_DRIVER_ASSIGNED],
            LiveRideRequest::STATUS_DRIVER_ARRIVING,
            ['arrived_at' => now()],
            'driver_arrived',
            LiveRideDriverArrived::class,
        );
    }

    public function startRide(LiveRideRequest $liveRideRequest, User $driver): LiveRideRequest
    {
        return $this->transitionDriverRide(
            $liveRideRequest,
            $driver,
            [
                LiveRideRequest::STATUS_DRIVER_ASSIGNED,
                LiveRideRequest::STATUS_DRIVER_ARRIVING,
                LiveRideRequest::STATUS_RIDER_ONBOARD,
            ],
            LiveRideRequest::STATUS_IN_PROGRESS,
            ['started_at' => now()],
            'trip_started',
            LiveRideStarted::class,
        );
    }

    public function completeRide(LiveRideRequest $liveRideRequest, User $driver, ?float $finalFare = null): LiveRideRequest
    {
        $completedRide = $this->transitionDriverRide(
            $liveRideRequest,
            $driver,
            [
                LiveRideRequest::STATUS_DRIVER_ASSIGNED,
                LiveRideRequest::STATUS_DRIVER_ARRIVING,
                LiveRideRequest::STATUS_IN_PROGRESS,
            ],
            LiveRideRequest::STATUS_COMPLETED,
            [
                'completed_at' => now(),
                'final_fare' => $finalFare ?? $liveRideRequest->estimated_fare,
            ],
            'trip_completed',
            LiveRideCompleted::class,
        );

        DriverAvailability::query()->where('driver_user_id', $driver->id)->update([
            'is_available' => true,
            'last_seen_at' => now(),
        ]);

        return $completedRide;
    }

    public function cancelByRider(LiveRideRequest $liveRideRequest, User $rider, ?string $reason = null): LiveRideRequest
    {
        if ($liveRideRequest->rider_user_id !== $rider->id) {
            throw ValidationException::withMessages([
                'ride' => ['You are not allowed to cancel this ride.'],
            ]);
        }

        return $this->cancelRide($liveRideRequest, $rider, 'rider', $reason);
    }

    public function cancelByDriver(LiveRideRequest $liveRideRequest, User $driver, ?string $reason = null): LiveRideRequest
    {
        if ($liveRideRequest->driver_user_id !== $driver->id) {
            throw ValidationException::withMessages([
                'ride' => ['You are not allowed to cancel this ride.'],
            ]);
        }

        return $this->cancelRide($liveRideRequest, $driver, 'driver', $reason);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function updateDriverAvailability(User $driver, array $attributes): DriverAvailability
    {
        return DriverAvailability::query()->updateOrCreate(
            ['driver_user_id' => $driver->id],
            [
                'is_online' => (bool) $attributes['is_online'],
                'is_available' => (bool) $attributes['is_available'],
                'vehicle_type' => $attributes['vehicle_type'] ?? null,
                'last_seen_at' => now(),
            ],
        );
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function updateDriverLocation(User $driver, array $attributes): DriverLocation
    {
        $location = DriverLocation::query()->updateOrCreate(
            ['driver_user_id' => $driver->id],
            [
                'latitude' => $attributes['latitude'],
                'longitude' => $attributes['longitude'],
                'heading' => $attributes['heading'] ?? null,
                'speed' => $attributes['speed'] ?? null,
                'accuracy' => $attributes['accuracy'] ?? null,
                'recorded_at' => now(),
            ],
        );

        DriverAvailability::query()->updateOrCreate(
            ['driver_user_id' => $driver->id],
            [
                'is_online' => true,
                'last_seen_at' => now(),
            ],
        );

        $activeRide = LiveRideRequest::query()
            ->where('driver_user_id', $driver->id)
            ->whereIn('status', LiveRideRequest::ACTIVE_STATUSES)
            ->latest('updated_at')
            ->first();

        if ($activeRide) {
            $this->appendDispatchEvent($activeRide, 'driver_location_updated', $driver->id, [
                'latitude' => (float) $location->latitude,
                'longitude' => (float) $location->longitude,
            ]);

            $activeRide->load(['rider', 'driver', 'latestDriverLocation', 'dispatchEvents.actor']);

            broadcast(new LiveRideDriverLocationUpdated($activeRide))->toOthers();
        }

        return $location;
    }

    public function expire(LiveRideRequest $liveRideRequest): LiveRideRequest
    {
        $liveRideRequest->forceFill([
            'status' => LiveRideRequest::STATUS_EXPIRED,
        ])->save();

        $this->appendDispatchEvent($liveRideRequest, 'request_expired', null);

        $liveRideRequest->load(['rider', 'driver', 'latestDriverLocation', 'dispatchEvents.actor']);

        broadcast(new LiveRideExpired($liveRideRequest))->toOthers();

        return $liveRideRequest;
    }

    private function ensureUserHasNoActiveRide(int $userId, string $column): void
    {
        $exists = LiveRideRequest::query()
            ->where($column, $userId)
            ->whereIn('status', LiveRideRequest::ACTIVE_STATUSES)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                $column => ['There is already an active live ride for this user.'],
            ]);
        }
    }

    private function cancelRide(LiveRideRequest $liveRideRequest, User $actor, string $cancelledBy, ?string $reason = null): LiveRideRequest
    {
        if (! in_array($liveRideRequest->status, LiveRideRequest::ACTIVE_STATUSES, true)) {
            throw ValidationException::withMessages([
                'ride' => ['Only active live rides can be cancelled.'],
            ]);
        }

        $liveRideRequest->forceFill([
            'status' => LiveRideRequest::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'cancelled_by' => $cancelledBy,
            'cancellation_reason' => $reason,
        ])->save();

        if ($liveRideRequest->driver_user_id) {
            DriverAvailability::query()->where('driver_user_id', $liveRideRequest->driver_user_id)->update([
                'is_available' => true,
                'last_seen_at' => now(),
            ]);
        }

        $this->appendDispatchEvent($liveRideRequest, $cancelledBy.'_cancelled', $actor->id, [
            'reason' => $reason,
        ]);

        $liveRideRequest->load(['rider', 'driver', 'latestDriverLocation', 'dispatchEvents.actor']);

        broadcast(new LiveRideCancelled($liveRideRequest))->toOthers();

        return $liveRideRequest;
    }

    private function transitionDriverRide(
        LiveRideRequest $liveRideRequest,
        User $driver,
        array $allowedStatuses,
        string $targetStatus,
        array $attributes,
        string $eventType,
        string $eventClass,
    ): LiveRideRequest {
        if ($liveRideRequest->driver_user_id !== $driver->id) {
            throw ValidationException::withMessages([
                'ride' => ['You are not assigned to this live ride.'],
            ]);
        }

        if (! in_array($liveRideRequest->status, $allowedStatuses, true)) {
            throw ValidationException::withMessages([
                'status' => ['This status transition is not allowed.'],
            ]);
        }

        $liveRideRequest->forceFill(array_merge($attributes, [
            'status' => $targetStatus,
        ]))->save();

        $this->appendDispatchEvent($liveRideRequest, $eventType, $driver->id);

        $liveRideRequest->load(['rider', 'driver', 'latestDriverLocation', 'dispatchEvents.actor']);

        broadcast(new $eventClass($liveRideRequest))->toOthers();

        return $liveRideRequest;
    }

    /**
     * @param  array<string, mixed>|null  $payload
     */
    public function appendDispatchEvent(LiveRideRequest $liveRideRequest, string $eventType, ?int $actorUserId, ?array $payload = null): RideDispatchEvent
    {
        return RideDispatchEvent::query()->create([
            'live_ride_request_id' => $liveRideRequest->id,
            'event_type' => $eventType,
            'actor_user_id' => $actorUserId,
            'payload' => $payload,
            'occurred_at' => now(),
        ]);
    }
}
