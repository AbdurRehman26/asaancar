<?php

use App\Models\Area;
use App\Models\City;
use App\Models\RideRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->city = City::create(['name' => 'Karachi']);

    collect([
        'Airport',
        'Clifton',
        'DHA',
        'Saddar',
        'Gulshan',
        'Nazimabad',
    ])->each(function (string $areaName): void {
        Area::create([
            'city_id' => $this->city->id,
            'name' => $areaName,
            'slug' => str($areaName)->slug()->toString(),
            'is_active' => true,
        ]);
    });
});

it('generates ride requests with valid constraints', function () {
    $firstUser = User::factory()->create([
        'name' => 'User One',
        'email' => 'one@example.com',
        'phone_number' => '03001234567',
    ]);

    $secondUser = User::factory()->create([
        'name' => 'User Two',
        'email' => 'two@example.com',
        'phone_number' => '03007654321',
    ]);

    $this->artisan('ride-request:generate', [
        '--users' => [$firstUser->id, $secondUser->id],
        '--services-per-user' => 2,
        '--preferred-driver-gender' => 'female',
        '--roundtrip-mode' => 'no',
        '--schedule-types' => ['once'],
    ])->assertSuccessful();

    $requests = RideRequest::query()
        ->orderBy('id')
        ->get();

    expect($requests)->toHaveCount(4);

    $requests->each(function (RideRequest $request) use ($firstUser, $secondUser): void {
        expect([$firstUser->id, $secondUser->id])->toContain($request->user_id);
        expect($request->preferred_driver_gender)->toBe('female');
        expect($request->required_seats)->toBeGreaterThanOrEqual(1)->toBeLessThanOrEqual(4);
        expect($request->schedule_type)->toBe('once');
        expect($request->is_system_generated)->toBeTrue();
        expect((int) $request->budget_per_seat)->toBeGreaterThanOrEqual(120)->toBeLessThanOrEqual(300);
        expect($request->name)->not->toBeEmpty();
        expect($request->contact)->not->toBeEmpty();
    });
});

it('scales recurring everyday budget to a monthly amount', function () {
    $user = User::factory()->create([
        'name' => 'Recurring User',
        'email' => 'recurring@example.com',
        'phone_number' => '03001112222',
    ]);

    $this->artisan('ride-request:generate', [
        '--users' => [$user->id],
        '--services-per-user' => 1,
        '--preferred-driver-gender' => 'male',
        '--roundtrip-mode' => 'no',
        '--schedule-types' => ['everyday'],
    ])->assertSuccessful();

    $request = RideRequest::query()->firstOrFail();

    expect($request->schedule_type)->toBe('everyday');
    expect($request->is_system_generated)->toBeTrue();
    expect((int) $request->budget_per_seat)->toBeGreaterThanOrEqual(3600)->toBeLessThanOrEqual(9000);
    expect($request->required_seats)->toBeGreaterThanOrEqual(1)->toBeLessThanOrEqual(4);
});

it('supports generating a total number of ride requests with selected custom days', function () {
    $firstUser = User::factory()->create([
        'name' => 'Custom One',
        'email' => 'custom-one@example.com',
        'phone_number' => '03003334444',
    ]);

    $secondUser = User::factory()->create([
        'name' => 'Custom Two',
        'email' => 'custom-two@example.com',
        'phone_number' => '03005556666',
    ]);

    $this->artisan('ride-request:generate', [
        '--users' => [$firstUser->id, $secondUser->id],
        '--total-services' => 3,
        '--preferred-driver-gender' => 'male',
        '--roundtrip-mode' => 'no',
        '--schedule-types' => ['custom'],
        '--custom-days' => ['Monday', 'Friday'],
    ])->assertSuccessful();

    $requests = RideRequest::query()->orderBy('id')->get();

    expect($requests)->toHaveCount(3);

    $requests->each(function (RideRequest $request) use ($firstUser, $secondUser): void {
        expect([$firstUser->id, $secondUser->id])->toContain($request->user_id);
        expect($request->schedule_type)->toBe('custom');
        expect($request->selected_days)->toBe(['Monday', 'Friday']);
        expect((int) $request->budget_per_seat)->toBeGreaterThanOrEqual(1080)->toBeLessThanOrEqual(2700);
    });
});

it('supports random schedule selection', function () {
    $user = User::factory()->create([
        'name' => 'Random Schedule User',
        'email' => 'random-schedule@example.com',
        'phone_number' => '03007778888',
    ]);

    $this->artisan('ride-request:generate', [
        '--users' => [$user->id],
        '--total-services' => 1,
        '--preferred-driver-gender' => 'random',
        '--roundtrip-mode' => 'no',
        '--schedule-types' => ['random'],
        '--custom-days' => ['Tuesday', 'Thursday'],
    ])->assertSuccessful();

    $request = RideRequest::query()->firstOrFail();

    expect(['once', 'everyday', 'weekdays', 'weekends', 'custom'])->toContain($request->schedule_type);

    if ($request->schedule_type === 'custom') {
        expect($request->selected_days)->toBe(['Tuesday', 'Thursday']);
    }
});

it('supports comma separated user ids from the cli', function () {
    $firstUser = User::factory()->create([
        'name' => 'CLI One',
        'email' => 'cli-one@example.com',
        'phone_number' => '03009990001',
    ]);

    $secondUser = User::factory()->create([
        'name' => 'CLI Two',
        'email' => 'cli-two@example.com',
        'phone_number' => '03009990002',
    ]);

    $this->artisan('ride-request:generate', [
        '--users' => ["{$firstUser->id},{$secondUser->id}"],
        '--total-services' => 2,
        '--preferred-driver-gender' => 'male',
        '--roundtrip-mode' => 'no',
        '--schedule-types' => ['once'],
    ])->assertSuccessful();

    $requests = RideRequest::query()->orderBy('id')->get();

    expect($requests)->toHaveCount(2);
    expect($requests->pluck('user_id')->unique()->all())
        ->toEqualCanonicalizing([$firstUser->id, $secondUser->id]);
});

it('uses only the first and last displayed users when random user selection is chosen interactively', function () {
    $users = User::factory()->count(10)->create();
    $sortedUsers = $users->sortBy('id')->values();
    $userChoices = ['random'];

    foreach ($sortedUsers->take(10) as $user) {
        $contact = $user->email ?: ($user->phone_number ?: 'No contact');
        $userChoices[] = "{$user->id} - {$user->name} ({$contact})";
    }

    $this->artisan('ride-request:generate')
        ->expectsChoice(
            'Select one or more users to generate ride requests for (use comma-separated selections, or choose random)',
            ['random'],
            $userChoices,
        )
        ->expectsQuestion('How many ride requests should be created?', '2')
        ->expectsChoice('Select preferred driver gender', 'male', ['male', 'female', 'any', 'random'])
        ->expectsChoice('Should return be included, excluded, or random?', 'no', ['yes', 'no', 'random'])
        ->expectsChoice(
            'Which schedule types should be used?',
            ['once'],
            ['once', 'everyday', 'weekdays', 'weekends', 'custom', 'random'],
        )
        ->assertSuccessful();

    $selectedUserIds = RideRequest::query()
        ->orderBy('id')
        ->pluck('user_id')
        ->unique()
        ->values()
        ->all();

    expect($selectedUserIds)->not->toBeEmpty();
    expect($selectedUserIds)->each->toBeIn([
        $sortedUsers->get(0)->id,
        $sortedUsers->get(9)->id,
    ]);
});

it('supports fixed and random roundtrip generation', function () {
    $user = User::factory()->create([
        'name' => 'Roundtrip User',
        'email' => 'roundtrip@example.com',
        'phone_number' => '03008889999',
    ]);

    $this->artisan('ride-request:generate', [
        '--users' => [$user->id],
        '--total-services' => 2,
        '--preferred-driver-gender' => 'male',
        '--roundtrip-mode' => 'yes',
        '--schedule-types' => ['once'],
    ])->assertSuccessful();

    RideRequest::query()->orderBy('id')->get()->each(function (RideRequest $request): void {
        expect($request->is_roundtrip)->toBeTrue();
        expect($request->return_time)->not->toBeNull();
    });

    RideRequest::query()->delete();

    $this->artisan('ride-request:generate', [
        '--users' => [$user->id],
        '--total-services' => 3,
        '--preferred-driver-gender' => 'male',
        '--roundtrip-mode' => 'random',
        '--schedule-types' => ['once'],
    ])->assertSuccessful();

    RideRequest::query()->orderBy('id')->get()->each(function (RideRequest $request): void {
        expect($request->is_roundtrip)->toBeIn([true, false]);

        if ($request->is_roundtrip) {
            expect($request->return_time)->not->toBeNull();
        } else {
            expect($request->return_time)->toBeNull();
        }
    });
});
