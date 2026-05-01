<?php

namespace App\Events;

class LiveRideCancelled extends AbstractLiveRideEvent
{
    protected function message(): string
    {
        return 'Trip cancelled.';
    }
}
