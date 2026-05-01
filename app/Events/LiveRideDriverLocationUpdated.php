<?php

namespace App\Events;

class LiveRideDriverLocationUpdated extends AbstractLiveRideEvent
{
    protected function message(): string
    {
        return 'Driver location updated.';
    }
}
