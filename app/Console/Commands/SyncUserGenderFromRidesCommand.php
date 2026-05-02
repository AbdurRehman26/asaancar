<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SyncUserGenderFromRidesCommand extends Command
{
    protected $signature = 'users:sync-gender
        {--users=* : Specific user IDs to sync}
        {--chunk=100 : Number of users to process per chunk}
        {--force : Overwrite existing user genders}';

    protected $description = 'Sync user gender from their latest pick and drop service, or fallback to their latest ride request.';

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
            $query->whereNull('gender');
        }

        $totals = [
            'processed' => 0,
            'updated' => 0,
            'skipped' => 0,
        ];

        $query->chunkById($chunkSize, function ($users) use (&$totals): void {
            foreach ($users as $user) {
                $totals['processed']++;

                $resolvedGender = $this->resolveGender($user);

                if ($resolvedGender === null || $user->gender === $resolvedGender) {
                    $totals['skipped']++;

                    continue;
                }

                $user->forceFill([
                    'gender' => $resolvedGender,
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

    private function resolveGender(User $user): ?string
    {
        $pickAndDropGender = $user->pickAndDropServices->first()?->driver_gender;

        if (in_array($pickAndDropGender, ['male', 'female'], true)) {
            return $pickAndDropGender;
        }

        $rideRequestGender = $user->rideRequests->first()?->preferred_driver_gender;

        if (in_array($rideRequestGender, ['male', 'female'], true)) {
            return $rideRequestGender;
        }

        return null;
    }
}
