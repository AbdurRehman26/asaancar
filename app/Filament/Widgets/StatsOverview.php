<?php

namespace App\Filament\Widgets;

use App\Models\Car;
use App\Models\Store;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Stores', Store::count())
                ->description('Rental car stores')
                ->descriptionIcon('heroicon-m-building-storefront')
                ->color('success'),

            Stat::make('Total Cars', Car::count())
                ->description('Available cars for rent')
                ->descriptionIcon('heroicon-m-truck')
                ->color('info'),

            Stat::make('Total Users', User::count())
                ->description('Registered users')
                ->descriptionIcon('heroicon-m-users')
                ->color('warning'),

            Stat::make('Average Cars per Store', Store::count() > 0 ? round(Car::count() / Store::count(), 1) : 0)
                ->description('Cars per store')
                ->descriptionIcon('heroicon-m-chart-bar')
                ->color('primary'),
        ];
    }
}
