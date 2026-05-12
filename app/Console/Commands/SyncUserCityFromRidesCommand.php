<?php

namespace App\Console\Commands;

use App\Models\City;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class SyncUserCityFromRidesCommand extends Command
{
    protected $signature = 'users:sync-city
        {--users=* : Specific user IDs to sync}
        {--chunk=100 : Number of users to process per chunk}
        {--force : Overwrite existing user city IDs}';

    protected $description = 'Sync user city from their latest pick and drop service, or fallback to their latest ride request.';

    public function handle(): int
    {
        $chunkSize = max(1, (int) $this->option('chunk'));
        $force = (bool) $this->option('force');
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

        $cities = City::query()
            ->orderByDesc('name')
            ->get(['id', 'name']);

        $query = User::query()
            ->with([
                'pickAndDropServices' => fn (HasMany $relation): HasMany => $relation->latest('id')->limit(1),
                'rideRequests' => fn (HasMany $relation): HasMany => $relation->latest('id')->limit(1),
            ])
            ->orderBy('id');

        if ($userIds->isNotEmpty()) {
            $query->whereIn('id', $userIds);
        }

        if (! $force) {
            $query->whereNull('city_id');
        }

        $totals = [
            'processed' => 0,
            'updated' => 0,
            'skipped' => 0,
        ];

        $query->chunkById($chunkSize, function ($users) use (&$totals, $cities): void {
            foreach ($users as $user) {
                $totals['processed']++;

                $resolvedCityId = $this->resolveCityId($user, $cities);

                if ($resolvedCityId === null || $user->city_id === $resolvedCityId) {
                    $totals['skipped']++;

                    continue;
                }

                $user->forceFill([
                    'city_id' => $resolvedCityId,
                ])->save();

                $totals['updated']++;
            }
        });

        $this->newLine();
        $this->table(
            ['Processed', 'Updated', 'Skipped'],
            [[
                $totals['processed'],
                $totals['updated'],
                $totals['skipped'],
            ]]
        );

        return self::SUCCESS;
    }

    /**
     * @param  Collection<int, City>  $cities
     */
    private function resolveCityId(User $user, Collection $cities): ?int
    {
        $pickAndDrop = $user->pickAndDropServices->first();

        if ($pickAndDrop?->pickup_city_id) {
            return (int) $pickAndDrop->pickup_city_id;
        }

        if ($pickAndDrop?->dropoff_city_id) {
            return (int) $pickAndDrop->dropoff_city_id;
        }

        $rideRequest = $user->rideRequests->first();

        if (! $rideRequest) {
            return null;
        }

        $haystacks = array_filter([
            mb_strtolower((string) $rideRequest->start_location),
            mb_strtolower((string) $rideRequest->end_location),
        ]);

        foreach ($cities as $city) {
            $cityName = mb_strtolower($city->name);

            foreach ($haystacks as $haystack) {
                if ($haystack !== '' && str_contains($haystack, $cityName)) {
                    return (int) $city->id;
                }
            }
        }

        return null;
    }
}
