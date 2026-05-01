<?php

namespace App\Events;

class LiveRideDriverArrived extends AbstractLiveRideEvent
{
    protected function message(): string
    {
        return 'Driver has arrived.';
    }
}
