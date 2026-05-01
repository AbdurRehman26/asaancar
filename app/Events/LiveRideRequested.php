<?php

namespace App\Events;

use App\Http\Resources\LiveRideRequestResource;
use App\Models\LiveRideRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LiveRideRequested implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public LiveRideRequest $liveRideRequest,
        public int $driverUserId,
    ) {
        $this->liveRideRequest->loadMissing(['rider', 'driver', 'latestDriverLocation', 'dispatchEvents.actor']);
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('driver.'.$this->driverUserId);
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'data' => (new LiveRideRequestResource($this->liveRideRequest))->resolve(),
            'message' => 'New live ride request available.',
        ];
    }

    public function broadcastAs(): string
    {
        return 'LiveRideRequested';
    }
}
