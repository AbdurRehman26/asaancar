<?php

use App\Filament\Widgets\StatsOverview;
use App\Models\PickAndDrop;

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
