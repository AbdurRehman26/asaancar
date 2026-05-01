<?php

namespace App\Events;

class LiveRideCompleted extends AbstractLiveRideEvent
{
    protected function message(): string
    {
        return 'Trip completed.';
    }
}
