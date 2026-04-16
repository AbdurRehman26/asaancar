<?php

use App\Models\Area;
use App\Models\City;
use App\Models\PickAndDrop;
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

it('generates pick and drop services with valid stops and constraints', function () {
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

    $this->artisan('pick-and-drop:generate', [
        '--users' => [$firstUser->id, $secondUser->id],
        '--services-per-user' => 2,
        '--include-stops' => 'yes',
        '--stop-count' => 2,
        '--driver-gender' => 'female',
        '--roundtrip-mode' => 'no',
        '--schedule-types' => ['once'],
    ])->assertSuccessful();

    $services = PickAndDrop::query()
        ->with('stops')
        ->orderBy('id')
        ->get();

    expect($services)->toHaveCount(4);

    $services->each(function (PickAndDrop $service) use ($firstUser, $secondUser): void {
        expect([$firstUser->id, $secondUser->id])->toContain($service->user_id);
        expect($service->driver_gender)->toBe('female');
        expect($service->available_spaces)->toBeGreaterThanOrEqual(1)->toBeLessThanOrEqual(4);
        expect($service->schedule_type)->toBe('once');
        expect($service->is_system_generated)->toBeTrue();
        expect((int) $service->price_per_person)->toBeGreaterThanOrEqual(120)->toBeLessThanOrEqual(300);
        expect($service->stops->count())->toBeGreaterThanOrEqual(1)->toBeLessThanOrEqual(2);

        $previousStopTime = $service->departure_time->copy();

        $service->stops->each(function ($stop) use (&$previousStopTime): void {
            expect($stop->stop_time->greaterThan($previousStopTime))->toBeTrue();
            $previousStopTime = $stop->stop_time->copy();
        });
    });
});

it('scales recurring everyday pricing to a monthly amount', function () {
    $user = User::factory()->create([
        'name' => 'Recurring User',
        'email' => 'recurring@example.com',
        'phone_number' => '03001112222',
    ]);

    $this->artisan('pick-and-drop:generate', [
        '--users' => [$user->id],
        '--services-per-user' => 1,
        '--include-stops' => 'no',
        '--driver-gender' => 'male',
        '--roundtrip-mode' => 'no',
        '--schedule-types' => ['everyday'],
    ])->assertSuccessful();

    $service = PickAndDrop::query()->firstOrFail();

    expect($service->schedule_type)->toBe('everyday');
    expect($service->is_system_generated)->toBeTrue();
    expect($service->is_everyday)->toBeTrue();
    expect((int) $service->price_per_person)->toBeGreaterThanOrEqual(3600)->toBeLessThanOrEqual(9000);
    expect($service->available_spaces)->toBeGreaterThanOrEqual(1)->toBeLessThanOrEqual(4);
});

it('supports random stop generation up to a maximum value', function () {
    $user = User::factory()->create([
        'name' => 'Random Stops User',
        'email' => 'random-stops@example.com',
        'phone_number' => '03002223333',
    ]);

    $this->artisan('pick-and-drop:generate', [
        '--users' => [$user->id],
        '--services-per-user' => 5,
        '--include-stops' => 'yes',
        '--stop-count' => 3,
        '--driver-gender' => 'random',
        '--roundtrip-mode' => 'no',
        '--schedule-types' => ['once'],
    ])->assertSuccessful();

    $services = PickAndDrop::query()
        ->with('stops')
        ->orderBy('id')
        ->get();

    expect($services)->toHaveCount(5);

    $services->each(function (PickAndDrop $service): void {
        expect($service->stops->count())->toBeGreaterThanOrEqual(1)->toBeLessThanOrEqual(3);

        $previousStopTime = $service->departure_time->copy();

        $service->stops->each(function ($stop) use (&$previousStopTime): void {
            expect($stop->stop_time->greaterThan($previousStopTime))->toBeTrue();
            $previousStopTime = $stop->stop_time->copy();
        });
    });
});

it('supports generating a total number of services with selected custom days', function () {
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

    $this->artisan('pick-and-drop:generate', [
        '--users' => [$firstUser->id, $secondUser->id],
        '--total-services' => 3,
        '--include-stops' => 'no',
        '--driver-gender' => 'male',
        '--roundtrip-mode' => 'no',
        '--schedule-types' => ['custom'],
        '--custom-days' => ['Monday', 'Friday'],
    ])->assertSuccessful();

    $services = PickAndDrop::query()->orderBy('id')->get();

    expect($services)->toHaveCount(3);

    $services->each(function (PickAndDrop $service) use ($firstUser, $secondUser): void {
        expect([$firstUser->id, $secondUser->id])->toContain($service->user_id);
        expect($service->schedule_type)->toBe('custom');
        expect($service->selected_days)->toBe(['Monday', 'Friday']);
        expect((int) $service->price_per_person)->toBeGreaterThanOrEqual(1080)->toBeLessThanOrEqual(2700);
    });
});

it('supports random schedule selection', function () {
    $user = User::factory()->create([
        'name' => 'Random Schedule User',
        'email' => 'random-schedule@example.com',
        'phone_number' => '03007778888',
    ]);

    $this->artisan('pick-and-drop:generate', [
        '--users' => [$user->id],
        '--total-services' => 1,
        '--include-stops' => 'no',
        '--driver-gender' => 'random',
        '--roundtrip-mode' => 'no',
        '--schedule-types' => ['random'],
        '--custom-days' => ['Tuesday', 'Thursday'],
    ])->assertSuccessful();

    $service = PickAndDrop::query()->firstOrFail();

    expect(['once', 'everyday', 'weekdays', 'weekends', 'custom'])->toContain($service->schedule_type);

    if ($service->schedule_type === 'custom') {
        expect($service->selected_days)->toBe(['Tuesday', 'Thursday']);
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

    $this->artisan('pick-and-drop:generate', [
        '--users' => ["{$firstUser->id},{$secondUser->id}"],
        '--total-services' => 2,
        '--include-stops' => 'no',
        '--driver-gender' => 'male',
        '--roundtrip-mode' => 'no',
        '--schedule-types' => ['once'],
    ])->assertSuccessful();

    $services = PickAndDrop::query()->orderBy('id')->get();

    expect($services)->toHaveCount(2);
    expect($services->pluck('user_id')->unique()->all())
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

    $this->artisan('pick-and-drop:generate')
        ->expectsChoice(
            'Select one or more users to generate pick and drop rows for (use comma-separated selections, or choose random)',
            ['random'],
            $userChoices,
        )
        ->expectsQuestion('How many services should be created?', '2')
        ->expectsConfirmation('Should stops be included?', false)
        ->expectsChoice('Select driver gender', 'male', ['male', 'female', 'random'])
        ->expectsChoice('Should return be included, excluded, or random?', 'no', ['yes', 'no', 'random'])
        ->expectsChoice(
            'Which schedule types should be used?',
            ['once'],
            ['once', 'everyday', 'weekdays', 'weekends', 'custom', 'random'],
        )
        ->assertSuccessful();

    $selectedUserIds = PickAndDrop::query()
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

    $this->artisan('pick-and-drop:generate', [
        '--users' => [$user->id],
        '--total-services' => 2,
        '--include-stops' => 'no',
        '--driver-gender' => 'male',
        '--roundtrip-mode' => 'yes',
        '--schedule-types' => ['once'],
    ])->assertSuccessful();

    PickAndDrop::query()->orderBy('id')->get()->each(function (PickAndDrop $service): void {
        expect($service->is_roundtrip)->toBeTrue();
        expect($service->return_time)->not->toBeNull();
    });

    PickAndDrop::query()->delete();

    $this->artisan('pick-and-drop:generate', [
        '--users' => [$user->id],
        '--total-services' => 3,
        '--include-stops' => 'no',
        '--driver-gender' => 'male',
        '--roundtrip-mode' => 'random',
        '--schedule-types' => ['once'],
    ])->assertSuccessful();

    PickAndDrop::query()->orderBy('id')->get()->each(function (PickAndDrop $service): void {
        expect($service->is_roundtrip)->toBeIn([true, false]);

        if ($service->is_roundtrip) {
            expect($service->return_time)->not->toBeNull();
        } else {
            expect($service->return_time)->toBeNull();
        }
    });
});
