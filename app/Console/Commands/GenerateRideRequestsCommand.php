<?php

namespace App\Console\Commands;

use App\Models\Area;
use App\Models\City;
use App\Models\RideRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class GenerateRideRequestsCommand extends Command
{
    protected $signature = 'ride-request:generate
        {--users=* : User IDs to generate ride requests for}
        {--total-services=0 : Total number of ride requests to generate}
        {--services-per-user=0 : Number of ride requests to generate per selected user}
        {--preferred-driver-gender= : Preferred driver gender to use (male/female/any/random)}
        {--roundtrip-mode= : Whether return should be included (yes/no/random)}
        {--schedule-types=* : Schedule types to generate (once/everyday/weekdays/weekends/custom/random)}
        {--custom-days=* : Selected days to use for custom schedules}';

    protected $description = 'Generate ride requests for selected users with realistic timings, seats, and budgets.';

    public function handle(): int
    {
        $users = $this->resolveUsers();

        if ($users->isEmpty()) {
            $this->error('No users selected. Command cancelled.');

            return self::FAILURE;
        }

        $eligibleCities = $this->getEligibleCities();

        if ($eligibleCities->isEmpty()) {
            $this->error('No eligible cities with at least two active areas were found.');

            return self::FAILURE;
        }

        $totalServices = $this->resolveTotalServices($users->count());
        $preferredDriverGender = $this->resolvePreferredDriverGender();
        $roundtripMode = $this->resolveRoundtripMode();
        $scheduleSelection = $this->resolveScheduleSelection();
        $userCycle = $users->shuffle()->values();

        $progressBar = $this->output->createProgressBar($totalServices);
        $progressBar->start();

        for ($requestIndex = 0; $requestIndex < $totalServices; $requestIndex++) {
            /** @var User $user */
            $user = $userCycle->get($requestIndex % $userCycle->count());

            $this->generateRideRequest(
                user: $user,
                eligibleCities: $eligibleCities,
                preferredDriverGender: $preferredDriverGender,
                roundtripMode: $roundtripMode,
                scheduleSelection: $scheduleSelection,
            );

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);
        $this->info("Generated {$totalServices} ride requests.");

        return self::SUCCESS;
    }

    /**
     * @return EloquentCollection<int, User>
     */
    private function resolveUsers(): EloquentCollection
    {
        $userIds = collect($this->option('users'))
            ->filter(fn (mixed $id): bool => filled($id))
            ->flatMap(function (mixed $id): array {
                return collect(explode(',', (string) $id))
                    ->map(fn (string $value): string => trim($value))
                    ->filter(fn (string $value): bool => $value !== '')
                    ->all();
            })
            ->map(fn (mixed $id): int => (int) $id)
            ->filter(fn (int $id): bool => $id > 0)
            ->unique()
            ->values();

        if ($userIds->isNotEmpty()) {
            $users = User::query()
                ->whereIn('id', $userIds)
                ->orderBy('id')
                ->get();

            if ($users->isEmpty()) {
                $this->warn('None of the provided user IDs were found.');
            }

            return $users;
        }

        $topUsers = User::query()
            ->orderBy('id')
            ->limit(10)
            ->get();

        if ($topUsers->isEmpty()) {
            return new EloquentCollection;
        }

        $labels = $topUsers
            ->map(fn (User $user): string => $this->formatUserLabel($user))
            ->all();
        $userChoices = ['random', ...$labels];

        $selectedLabels = (array) $this->choice(
            'Select one or more users to generate ride requests for (use comma-separated selections, or choose random)',
            $userChoices,
            default: null,
            attempts: null,
            multiple: true,
        );

        if (in_array('random', $selectedLabels, true)) {
            return new EloquentCollection(array_values(array_filter([
                $topUsers->values()->get(0),
                $topUsers->values()->get(9),
            ])));
        }

        return $topUsers
            ->filter(fn (User $user): bool => in_array($this->formatUserLabel($user), $selectedLabels, true))
            ->values();
    }

    /**
     * @return Collection<int, City>
     */
    private function getEligibleCities(): Collection
    {
        return City::query()
            ->with([
                'areas' => fn ($query) => $query->where('is_active', true)->orderBy('id'),
            ])
            ->get()
            ->filter(fn (City $city): bool => $city->areas->count() >= 2)
            ->values();
    }

    private function resolveTotalServices(int $selectedUserCount): int
    {
        $totalServices = (int) $this->option('total-services');

        if ($totalServices > 0) {
            return $totalServices;
        }

        $servicesPerUser = (int) $this->option('services-per-user');

        if ($servicesPerUser > 0) {
            return $selectedUserCount * $servicesPerUser;
        }

        return max(1, (int) $this->ask('How many ride requests should be created?', (string) $selectedUserCount));
    }

    private function resolvePreferredDriverGender(): string
    {
        $allowed = ['male', 'female', 'any', 'random'];
        $option = strtolower((string) $this->option('preferred-driver-gender'));

        if (in_array($option, $allowed, true)) {
            return $option;
        }

        return $this->choice('Select preferred driver gender', $allowed, 'random');
    }

    private function resolveRoundtripMode(): string
    {
        $allowed = ['yes', 'no', 'random'];
        $option = strtolower((string) $this->option('roundtrip-mode'));

        if (in_array($option, $allowed, true)) {
            return $option;
        }

        return $this->choice('Should return be included, excluded, or random?', $allowed, 'no');
    }

    /**
     * @return array{schedule_types: array<int, string>, custom_days: array<int, string>|null}
     */
    private function resolveScheduleSelection(): array
    {
        $allowed = ['once', 'everyday', 'weekdays', 'weekends', 'custom', 'random'];
        $optionScheduleTypes = collect($this->option('schedule-types'))
            ->filter(fn (mixed $type): bool => is_string($type) && $type !== '')
            ->map(fn (mixed $type): string => strtolower((string) $type))
            ->filter(fn (string $type): bool => in_array($type, $allowed, true))
            ->unique()
            ->values()
            ->all();

        $selectedScheduleTypes = $optionScheduleTypes !== []
            ? $optionScheduleTypes
            : (array) $this->choice(
                'Which schedule types should be used?',
                $allowed,
                default: 0,
                attempts: null,
                multiple: true,
            );

        if (in_array('random', $selectedScheduleTypes, true)) {
            $selectedScheduleTypes = ['once', 'everyday', 'weekdays', 'weekends', 'custom'];
        }

        $selectedScheduleTypes = collect($selectedScheduleTypes)
            ->filter(fn (string $type): bool => $type !== 'random')
            ->unique()
            ->values()
            ->all();

        $customDays = in_array('custom', $selectedScheduleTypes, true)
            ? $this->resolveCustomDays()
            : null;

        return [
            'schedule_types' => $selectedScheduleTypes,
            'custom_days' => $customDays,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function resolveCustomDays(): array
    {
        $allowedDays = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
        ];

        $optionDays = collect($this->option('custom-days'))
            ->filter(fn (mixed $day): bool => is_string($day) && $day !== '')
            ->map(fn (mixed $day): string => ucfirst(strtolower((string) $day)))
            ->filter(fn (string $day): bool => in_array($day, $allowedDays, true))
            ->unique()
            ->values()
            ->all();

        if ($optionDays !== []) {
            return $optionDays;
        }

        $selectedDays = (array) $this->choice(
            'Select day(s) for custom schedules',
            $allowedDays,
            default: null,
            attempts: null,
            multiple: true,
        );

        return collect($selectedDays)
            ->map(fn (mixed $day): string => (string) $day)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, City>  $eligibleCities
     * @param  array{schedule_types: array<int, string>, custom_days: array<int, string>|null}  $scheduleSelection
     */
    private function generateRideRequest(
        User $user,
        Collection $eligibleCities,
        string $preferredDriverGender,
        string $roundtripMode,
        array $scheduleSelection,
    ): RideRequest {
        /** @var City $city */
        $city = $eligibleCities->random();
        $areas = $city->areas->shuffle()->values();

        /** @var Area $startArea */
        $startArea = $areas->get(0);
        /** @var Area $endArea */
        $endArea = $areas->get(1);

        $scheduleType = collect($scheduleSelection['schedule_types'])->random();
        $selectedDays = $scheduleType === 'custom' ? $scheduleSelection['custom_days'] : null;
        $departureTime = $this->generateDepartureTime($scheduleType);
        $resolvedPreferredDriverGender = $preferredDriverGender === 'random'
            ? collect(['male', 'female', 'any'])->random()
            : $preferredDriverGender;
        $isRoundtrip = $this->resolveRoundtrip($roundtripMode);
        $returnTime = $isRoundtrip ? $this->generateReturnTime($departureTime) : null;
        $requiredSeats = random_int(1, 4);
        $baseBudget = random_int(120, 300);

        return RideRequest::query()->create([
            'user_id' => $user->id,
            'name' => $user->name,
            'contact' => $user->phone_number ?? $this->generateFallbackPhoneNumber(),
            'start_location' => $startArea->name,
            'end_location' => $endArea->name,
            'departure_time' => $departureTime->toDateTimeString(),
            'schedule_type' => $scheduleType,
            'selected_days' => $selectedDays,
            'is_roundtrip' => $isRoundtrip,
            'return_time' => $returnTime,
            'required_seats' => $requiredSeats,
            'preferred_driver_gender' => $resolvedPreferredDriverGender,
            'budget_per_seat' => $this->calculateBudgetPerSeat($scheduleType, $baseBudget, $selectedDays),
            'currency' => 'PKR',
            'description' => $this->buildDescription($city->name, $scheduleType, $requiredSeats, $resolvedPreferredDriverGender),
            'is_active' => true,
            'is_system_generated' => true,
        ]);
    }

    private function resolveRoundtrip(string $roundtripMode): bool
    {
        return match ($roundtripMode) {
            'yes' => true,
            'random' => (bool) random_int(0, 1),
            default => false,
        };
    }

    private function formatUserLabel(User $user): string
    {
        $contact = $user->email ?: ($user->phone_number ?: 'No contact');

        return "{$user->id} - {$user->name} ({$contact})";
    }

    private function generateDepartureTime(string $scheduleType): Carbon
    {
        $hour = random_int(6, 20);
        $minute = collect([0, 15, 30, 45])->random();

        if ($scheduleType === 'once') {
            return now()
                ->startOfDay()
                ->addDays(random_int(1, 21))
                ->setTime($hour, $minute);
        }

        return Carbon::create(2000, 1, 1, $hour, $minute, 0);
    }

    private function generateReturnTime(Carbon $departureTime): string
    {
        return $departureTime
            ->copy()
            ->addHours(random_int(4, 10))
            ->addMinutes(collect([0, 15, 30, 45])->random())
            ->format('H:i:s');
    }

    /**
     * @param  array<int, string>|null  $selectedDays
     */
    private function calculateBudgetPerSeat(string $scheduleType, int $baseBudget, ?array $selectedDays): int
    {
        $monthlyTrips = match ($scheduleType) {
            'once' => 1,
            'everyday' => 30,
            'weekdays' => 22,
            'weekends' => 8,
            'custom' => max(1, (int) round(count($selectedDays ?? []) * 4.3)),
            default => 1,
        };

        return $baseBudget * $monthlyTrips;
    }

    private function buildDescription(string $cityName, string $scheduleType, int $requiredSeats, string $preferredDriverGender): string
    {
        $scheduleLabel = match ($scheduleType) {
            'once' => 'One-time ride request',
            'everyday' => 'Daily commute request',
            'weekdays' => 'Weekday ride request',
            'weekends' => 'Weekend ride request',
            'custom' => 'Flexible scheduled ride request',
            default => 'Ride request',
        };

        $genderLabel = match ($preferredDriverGender) {
            'male' => ' Prefers a male driver.',
            'female' => ' Prefers a female driver.',
            default => ' Open to any driver.',
        };

        return "{$scheduleLabel} within {$cityName} for {$requiredSeats} seat(s).{$genderLabel}";
    }

    private function generateFallbackPhoneNumber(): string
    {
        return '03'.random_int(100000000, 999999999);
    }
}
