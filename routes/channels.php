<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{conversationId}', function ($user) {
    return true;
}, ['guards' => ['web', 'sanctum']]);
