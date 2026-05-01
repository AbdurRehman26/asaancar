<?php

namespace App\Events;

class LiveRideStarted extends AbstractLiveRideEvent
{
    protected function message(): string
    {
        return 'Trip started.';
    }
}
