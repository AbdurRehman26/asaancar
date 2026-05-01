<?php

namespace App\Events;

class LiveRideAssigned extends AbstractLiveRideEvent
{
    protected function message(): string
    {
        return 'Driver assigned successfully.';
    }
}
