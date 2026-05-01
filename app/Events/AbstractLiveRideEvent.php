<?php

namespace App\Events;

use App\Http\Resources\LiveRideRequestResource;
use App\Models\LiveRideRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

abstract class AbstractLiveRideEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public LiveRideRequest $liveRideRequest)
    {
        $this->liveRideRequest->loadMissing(['rider', 'driver', 'latestDriverLocation', 'dispatchEvents.actor']);
    }

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('user.'.$this->liveRideRequest->rider_user_id),
            new PrivateChannel('live-ride.'.$this->liveRideRequest->id),
        ];

        if ($this->liveRideRequest->driver_user_id) {
            $channels[] = new PrivateChannel('driver.'.$this->liveRideRequest->driver_user_id);
        }

        return $channels;
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'data' => (new LiveRideRequestResource($this->liveRideRequest))->resolve(),
            'message' => $this->message(),
        ];
    }

    public function broadcastAs(): string
    {
        return class_basename(static::class);
    }

    abstract protected function message(): string;
}
