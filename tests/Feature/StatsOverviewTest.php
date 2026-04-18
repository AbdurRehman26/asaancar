<?php

use App\Filament\Widgets\StatsOverview;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\PickAndDrop;
use App\Models\User;

it('includes the count of non-system-generated pick and drop services', function () {
    PickAndDrop::factory()->count(2)->create([
        'is_system_generated' => false,
    ]);

    PickAndDrop::factory()->count(3)->create([
        'is_system_generated' => true,
    ]);

    $widget = new class extends StatsOverview
    {
        public function exposedStats(): array
        {
            return $this->getStats();
        }
    };

    $manualPickAndDropStat = collect($widget->exposedStats())
        ->first(fn ($stat) => $stat->getLabel() === 'Manual Pick & Drop');

    expect($manualPickAndDropStat)->not->toBeNull()
        ->and($manualPickAndDropStat->getValue())->toBe(2);
});

it('includes unique male and female driver counts', function () {
    $maleDriver = User::factory()->create();
    $femaleDriver = User::factory()->create();
    $secondFemaleDriver = User::factory()->create();

    PickAndDrop::factory()->count(2)->create([
        'user_id' => $maleDriver->id,
        'driver_gender' => 'male',
    ]);

    PickAndDrop::factory()->create([
        'user_id' => $femaleDriver->id,
        'driver_gender' => 'female',
    ]);

    PickAndDrop::factory()->count(2)->create([
        'user_id' => $secondFemaleDriver->id,
        'driver_gender' => 'female',
    ]);

    $widget = new class extends StatsOverview
    {
        public function exposedStats(): array
        {
            return $this->getStats();
        }
    };

    $stats = collect($widget->exposedStats());

    $maleDriversStat = $stats->first(fn ($stat) => $stat->getLabel() === 'Male Drivers');
    $femaleDriversStat = $stats->first(fn ($stat) => $stat->getLabel() === 'Female Drivers');

    expect($maleDriversStat)->not->toBeNull()
        ->and($maleDriversStat->getValue())->toBe(1)
        ->and($femaleDriversStat)->not->toBeNull()
        ->and($femaleDriversStat->getValue())->toBe(2);
});

it('includes the total chat message count', function () {
    $sender = User::factory()->create();
    $recipient = User::factory()->create();

    $conversation = Conversation::query()->create([
        'type' => 'user',
        'user_id' => $sender->id,
        'recipient_user_id' => $recipient->id,
    ]);

    Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $sender->id,
        'message' => 'Hello there',
    ]);

    Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $recipient->id,
        'message' => 'Hi back',
    ]);

    $widget = new class extends StatsOverview
    {
        public function exposedStats(): array
        {
            return $this->getStats();
        }
    };

    $chatMessagesStat = collect($widget->exposedStats())
        ->first(fn ($stat) => $stat->getLabel() === 'Chat Messages');

    expect($chatMessagesStat)->not->toBeNull()
        ->and($chatMessagesStat->getValue())->toBe(2);
});
