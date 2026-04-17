<?php

namespace App\Filament\Widgets;

use App\Models\PickAndDrop;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Users', User::count())
                ->description('Registered users')
                ->descriptionIcon('heroicon-m-users')
                ->color('warning'),
            Stat::make('Manual Pick & Drop', PickAndDrop::query()->where('is_system_generated', false)->count())
                ->description('Non-system-generated services')
                ->descriptionIcon('heroicon-m-map-pin')
                ->color('success'),
        ];
    }
}
