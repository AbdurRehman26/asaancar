<?php

use App\Filament\Widgets\StatsOverview;
use App\Models\ContactingStat;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\PickAndDrop;
use App\Models\RideRequest;
use App\Models\User;

it('uses four stats columns on the admin dashboard', function () {
    $widget = new class extends StatsOverview
    {
        public function exposedColumns(): int
        {
            return $this->getColumns();
        }
    };

    expect($widget->exposedColumns())->toBe(4);
});

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
        ->and($manualPickAndDropStat->getValue())->toBe(2)
        ->and($manualPickAndDropStat->getDescription())->toBe('Today: 2');
});

it('includes the total ride request count', function () {
    RideRequest::factory()->count(3)->create();

    $widget = new class extends StatsOverview
    {
        public function exposedStats(): array
        {
            return $this->getStats();
        }
    };

    $rideRequestsStat = collect($widget->exposedStats())
        ->first(fn ($stat) => $stat->getLabel() === 'Ride Requests');

    expect($rideRequestsStat)->not->toBeNull()
        ->and($rideRequestsStat->getValue())->toBe(3)
        ->and($rideRequestsStat->getDescription())->toBe('Today: 3');
});

it('includes the count of users with expired otps', function () {
    User::factory()->create([
        'otp_code' => '123456',
        'otp_expires_at' => now()->subMinutes(5),
    ]);

    User::factory()->create([
        'otp_code' => '654321',
        'otp_expires_at' => now()->addMinutes(5),
    ]);

    User::factory()->create([
        'otp_code' => null,
        'otp_expires_at' => now()->subMinutes(10),
    ]);

    $widget = new class extends StatsOverview
    {
        public function exposedStats(): array
        {
            return $this->getStats();
        }
    };

    $expiredOtpUsersStat = collect($widget->exposedStats())
        ->first(fn ($stat) => $stat->getLabel() === 'Expired OTP Users');

    expect($expiredOtpUsersStat)->not->toBeNull()
        ->and($expiredOtpUsersStat->getValue())->toBe(1)
        ->and($expiredOtpUsersStat->getDescription())->toBe('Today: 1');
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
        ->and($maleDriversStat->getDescription())->toBe('Today: 1')
        ->and($femaleDriversStat)->not->toBeNull()
        ->and($femaleDriversStat->getValue())->toBe(2)
        ->and($femaleDriversStat->getDescription())->toBe('Today: 2');
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
        ->and($chatMessagesStat->getValue())->toBe(2)
        ->and($chatMessagesStat->getDescription())->toBe('Today: 2');
});

it('includes the total contact interaction count', function () {
    ContactingStat::factory()->create([
        'interaction_count' => 3,
    ]);

    ContactingStat::factory()->create([
        'interaction_count' => 5,
    ]);

    $widget = new class extends StatsOverview
    {
        public function exposedStats(): array
        {
            return $this->getStats();
        }
    };

    $contactInteractionsStat = collect($widget->exposedStats())
        ->first(fn ($stat) => $stat->getLabel() === 'Contact Interactions');

    expect($contactInteractionsStat)->not->toBeNull()
        ->and($contactInteractionsStat->getValue())->toBe(8)
        ->and($contactInteractionsStat->getDescription())->toBe('Today: 8');
});

it('includes today count descriptions for total users', function () {
    User::factory()->count(2)->create([
        'created_at' => now(),
    ]);

    User::factory()->create([
        'created_at' => now()->subDay(),
    ]);

    $widget = new class extends StatsOverview
    {
        public function exposedStats(): array
        {
            return $this->getStats();
        }
    };

    $totalUsersStat = collect($widget->exposedStats())
        ->first(fn ($stat) => $stat->getLabel() === 'Total Users');

    expect($totalUsersStat)->not->toBeNull()
        ->and($totalUsersStat->getValue())->toBe(3)
        ->and($totalUsersStat->getDescription())->toBe('Today: 2');
});
