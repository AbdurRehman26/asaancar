<?php

namespace App\Events;

class LiveRideExpired extends AbstractLiveRideEvent
{
    protected function message(): string
    {
        return 'Ride request expired.';
    }
}
