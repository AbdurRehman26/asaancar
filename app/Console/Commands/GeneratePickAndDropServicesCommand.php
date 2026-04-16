<?php

namespace App\Console\Commands;

use App\Models\City;
use App\Models\PickAndDrop;
use App\Models\PickAndDropStop;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class GeneratePickAndDropServicesCommand extends Command
{
    protected $signature = 'pick-and-drop:generate
        {--users=* : User IDs to generate services for}
        {--total-services=0 : Total number of services to generate}
        {--services-per-user=0 : Number of services to generate per selected user}
        {--include-stops= : Whether to include stops (yes/no)}
        {--stop-count=0 : Maximum number of random stops to generate per service}
        {--stop-count-max=0 : Legacy alias for maximum number of random stops}
        {--driver-gender= : Driver gender to use (male/female/random)}
        {--roundtrip-mode= : Whether return should be included (yes/no/random)}
        {--schedule-types=* : Schedule types to generate (once/everyday/weekdays/weekends/custom/random)}
        {--custom-days=* : Selected days to use for custom schedules}';

    protected $description = 'Generate pick and drop services for selected users with realistic timings, stops, and pricing.';

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
        $includeStops = $this->resolveIncludeStops();
        $stopCount = $includeStops ? $this->resolveStopCount() : 0;
        $driverGender = $this->resolveDriverGender();
        $roundtripMode = $this->resolveRoundtripMode();
        $scheduleSelection = $this->resolveScheduleSelection();

        $createdServices = 0;
        $createdStops = 0;
        $userCycle = $users->shuffle()->values();

        $progressBar = $this->output->createProgressBar($totalServices);
        $progressBar->start();

        for ($serviceIndex = 0; $serviceIndex < $totalServices; $serviceIndex++) {
            /** @var \App\Models\User $user */
            $user = $userCycle->get($serviceIndex % $userCycle->count());

            $generated = $this->generateService(
                user: $user,
                eligibleCities: $eligibleCities,
                includeStops: $includeStops,
                stopCount: $stopCount,
                driverGender: $driverGender,
                roundtripMode: $roundtripMode,
                scheduleSelection: $scheduleSelection,
            );

            $createdServices++;
            $createdStops += $generated['stops_created'];

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);
        $this->info("Generated {$createdServices} pick and drop services with {$createdStops} stops.");

        return self::SUCCESS;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\User>
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
            'Select one or more users to generate pick and drop rows for (use comma-separated selections, or choose random)',
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
     * @return \Illuminate\Support\Collection<int, \App\Models\City>
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

        return max(1, (int) $this->ask('How many services should be created?', (string) $selectedUserCount));
    }

    private function resolveIncludeStops(): bool
    {
        $option = $this->option('include-stops');

        if (is_string($option) && $option !== '') {
            return in_array(strtolower($option), ['1', 'true', 'yes', 'y'], true);
        }

        return $this->confirm('Should stops be included?', true);
    }

    private function resolveStopCount(): int
    {
        $option = (int) $this->option('stop-count');

        if ($option > 0) {
            return min(4, $option);
        }

        $legacyOption = (int) $this->option('stop-count-max');

        if ($legacyOption > 0) {
            return min(4, $legacyOption);
        }

        return max(1, min(4, (int) $this->ask('What should be the maximum number of random stops per service?', '1')));
    }

    private function resolveDriverGender(): string
    {
        $allowed = ['male', 'female', 'random'];
        $option = strtolower((string) $this->option('driver-gender'));

        if (in_array($option, $allowed, true)) {
            return $option;
        }

        return $this->choice('Select driver gender', $allowed, 'random');
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
     * @param  \Illuminate\Support\Collection<int, \App\Models\City>  $eligibleCities
     * @param  array{schedule_types: array<int, string>, custom_days: array<int, string>|null}  $scheduleSelection
     * @return array{service:\App\Models\PickAndDrop,stops_created:int}
     */
    private function generateService(
        User $user,
        Collection $eligibleCities,
        bool $includeStops,
        int $stopCount,
        string $driverGender,
        string $roundtripMode,
        array $scheduleSelection,
    ): array {
        /** @var \App\Models\City $city */
        $city = $eligibleCities->random();
        $areas = $city->areas->shuffle()->values();

        /** @var \App\Models\Area $pickupArea */
        $pickupArea = $areas->get(0);
        /** @var \App\Models\Area $dropoffArea */
        $dropoffArea = $areas->get(1);
        $availableStopAreas = $areas->slice(2)->values();
        $actualStopCount = $this->resolveActualStopCount(
            includeStops: $includeStops,
            stopCount: $stopCount,
            availableStopAreasCount: $availableStopAreas->count(),
        );
        $scheduleType = collect($scheduleSelection['schedule_types'])->random();
        $selectedDays = $scheduleType === 'custom' ? $scheduleSelection['custom_days'] : null;
        $departureTime = $this->generateDepartureTime($scheduleType);
        $resolvedDriverGender = $driverGender === 'random' ? collect(['male', 'female'])->random() : $driverGender;
        $isRoundtrip = $this->resolveRoundtrip($roundtripMode);
        $returnTime = $isRoundtrip ? $this->generateReturnTime($departureTime) : null;
        $baseFare = random_int(120, 300);
        $pricePerPerson = $this->calculatePricePerPerson($scheduleType, $baseFare, $selectedDays);

        $service = PickAndDrop::query()->create([
            'user_id' => $user->id,
            'name' => $user->name,
            'contact' => $user->phone_number ?? $this->generateFallbackPhoneNumber(),
            'start_location' => $pickupArea->name,
            'end_location' => $dropoffArea->name,
            'pickup_city_id' => $city->id,
            'dropoff_city_id' => $city->id,
            'pickup_area_id' => $pickupArea->id,
            'dropoff_area_id' => $dropoffArea->id,
            'available_spaces' => random_int(1, 4),
            'driver_gender' => $resolvedDriverGender,
            'car_brand' => collect(['Toyota', 'Honda', 'Suzuki', 'Kia', 'Hyundai'])->random(),
            'car_model' => collect(['Corolla', 'Civic', 'Cultus', 'Picanto', 'City'])->random(),
            'car_color' => collect(['White', 'Black', 'Silver', 'Gray', 'Blue'])->random(),
            'car_seats' => random_int(4, 7),
            'car_transmission' => collect(['manual', 'automatic'])->random(),
            'car_fuel_type' => collect(['petrol', 'diesel', 'hybrid'])->random(),
            'departure_time' => $departureTime->toDateTimeString(),
            'description' => $this->buildDescription($city->name, $scheduleType, $actualStopCount),
            'price_per_person' => $pricePerPerson,
            'currency' => 'PKR',
            'is_active' => true,
            'is_system_generated' => true,
            'is_everyday' => $scheduleType === 'everyday',
            'is_roundtrip' => $isRoundtrip,
            'return_time' => $returnTime,
            'schedule_type' => $scheduleType,
            'selected_days' => $selectedDays,
        ]);

        $stopsCreated = 0;
        $currentStopTime = $departureTime->copy();

        foreach ($availableStopAreas->take($actualStopCount) as $index => $stopArea) {
            $currentStopTime = $currentStopTime->copy()->addMinutes(random_int(20, 45));

            PickAndDropStop::query()->create([
                'pick_and_drop_service_id' => $service->id,
                'location' => $stopArea->name,
                'city_id' => $city->id,
                'area_id' => $stopArea->id,
                'stop_time' => $currentStopTime->toDateTimeString(),
                'order' => $index + 1,
                'notes' => $this->buildStopNote($index + 1, $actualStopCount),
            ]);

            $stopsCreated++;
        }

        return [
            'service' => $service,
            'stops_created' => $stopsCreated,
        ];
    }

    private function resolveRoundtrip(string $roundtripMode): bool
    {
        return match ($roundtripMode) {
            'yes' => true,
            'random' => (bool) random_int(0, 1),
            default => false,
        };
    }

    private function resolveActualStopCount(bool $includeStops, int $stopCount, int $availableStopAreasCount): int
    {
        if (! $includeStops || $availableStopAreasCount === 0) {
            return 0;
        }

        $cappedStopCount = min($stopCount, $availableStopAreasCount);

        return random_int(1, max(1, $cappedStopCount));
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
    private function calculatePricePerPerson(string $scheduleType, int $baseFare, ?array $selectedDays): int
    {
        $monthlyTrips = match ($scheduleType) {
            'once' => 1,
            'everyday' => 30,
            'weekdays' => 22,
            'weekends' => 8,
            'custom' => max(1, (int) round(count($selectedDays ?? []) * 4.3)),
            default => 1,
        };

        return $baseFare * $monthlyTrips;
    }

    private function buildDescription(string $cityName, string $scheduleType, int $stopCount): string
    {
        $scheduleLabel = match ($scheduleType) {
            'once' => 'Comfortable one-time ride',
            'everyday' => 'Reliable daily commute',
            'weekdays' => 'Convenient weekday commute',
            'weekends' => 'Comfortable weekend ride',
            'custom' => 'Flexible scheduled ride',
            default => 'ride',
        };

        $stopLabel = $stopCount > 0
            ? " Includes {$stopCount} stop(s) along the way."
            : ' Direct route with no extra stops.';

        return "{$scheduleLabel} within {$cityName}.{$stopLabel}";
    }

    private function buildStopNote(int $stopNumber, int $totalStops): string
    {
        return "Generated stop {$stopNumber} of {$totalStops}.";
    }

    private function generateFallbackPhoneNumber(): string
    {
        return '03'.random_int(100000000, 999999999);
    }
}
