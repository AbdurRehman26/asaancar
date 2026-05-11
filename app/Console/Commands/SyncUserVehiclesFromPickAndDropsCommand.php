<?php

namespace App\Console\Commands;

use App\Models\PickAndDrop;
use App\Models\UserVehicle;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class SyncUserVehiclesFromPickAndDropsCommand extends Command
{
    protected $signature = 'users:sync-vehicles-from-pick-and-drops
        {--users=* : Specific user IDs to sync}
        {--chunk=100 : Number of pick and drop services to process per chunk}';

    protected $description = 'Create saved user vehicles from existing pick and drop vehicle details.';

    public function handle(): int
    {
        $chunkSize = max(1, (int) $this->option('chunk'));
        $userIds = $this->resolveUserIds();

        $totals = [
            'processed' => 0,
            'created' => 0,
            'skipped' => 0,
        ];

        $query = PickAndDrop::query()
            ->where(function (Builder $builder): void {
                $builder
                    ->whereNotNull('vehicle_type')
                    ->orWhereNotNull('car_brand')
                    ->orWhereNotNull('car_model')
                    ->orWhereNotNull('car_color')
                    ->orWhereNotNull('car_seats')
                    ->orWhereNotNull('car_transmission')
                    ->orWhereNotNull('car_fuel_type');
            })
            ->orderBy('id');

        if ($userIds->isNotEmpty()) {
            $query->whereIn('user_id', $userIds);
        }

        $query->chunkById($chunkSize, function ($services) use (&$totals): void {
            foreach ($services as $service) {
                $totals['processed']++;

                $payload = [
                    'vehicle_type' => $service->vehicle_type ?: 'car',
                    'brand' => $service->car_brand,
                    'model' => $service->car_model,
                    'color' => $service->car_color,
                    'seats' => $service->car_seats,
                    'transmission' => $service->car_transmission,
                    'fuel_type' => $service->car_fuel_type,
                ];

                $alreadyExists = UserVehicle::query()
                    ->where('user_id', $service->user_id)
                    ->where('vehicle_type', $payload['vehicle_type'])
                    ->where('brand', $payload['brand'])
                    ->where('model', $payload['model'])
                    ->where('color', $payload['color'])
                    ->where('seats', $payload['seats'])
                    ->where('transmission', $payload['transmission'])
                    ->where('fuel_type', $payload['fuel_type'])
                    ->exists();

                if ($alreadyExists) {
                    $totals['skipped']++;

                    continue;
                }

                $isDefault = ! UserVehicle::query()->where('user_id', $service->user_id)->exists();

                UserVehicle::query()->create([
                    'user_id' => $service->user_id,
                    ...$payload,
                    'is_default' => $isDefault,
                ]);

                $totals['created']++;
            }
        });

        $this->newLine();
        $this->table(
            ['Processed', 'Created', 'Skipped'],
            [[
                $totals['processed'],
                $totals['created'],
                $totals['skipped'],
            ]]
        );

        return self::SUCCESS;
    }

    /**
     * @return Collection<int, int>
     */
    private function resolveUserIds(): Collection
    {
        return collect($this->option('users'))
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
    }
}
