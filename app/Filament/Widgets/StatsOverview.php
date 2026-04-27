<?php

namespace App\Filament\Widgets;

use App\Models\ContactingStat;
use App\Models\Message;
use App\Models\PickAndDrop;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getColumns(): int
    {
        return 4;
    }

    protected function getStats(): array
    {
        return [
            Stat::make('Total Users', User::count())
                ->description('Registered users')
                ->descriptionIcon('heroicon-m-users')
                ->color('warning'),
            Stat::make('Expired OTP Users', User::query()
                ->whereNotNull('otp_code')
                ->whereNotNull('otp_expires_at')
                ->where('otp_expires_at', '<', now())
                ->count())
                ->description('Users with expired OTPs')
                ->descriptionIcon('heroicon-m-clock')
                ->color('danger'),
            Stat::make('Manual Pick & Drop', PickAndDrop::query()->where('is_system_generated', false)->count())
                ->description('Non-system-generated services')
                ->descriptionIcon('heroicon-m-map-pin')
                ->color('success'),
            Stat::make('Male Drivers', PickAndDrop::query()->where('driver_gender', 'male')->distinct('user_id')->count('user_id'))
                ->description('Unique male drivers')
                ->descriptionIcon('heroicon-m-user')
                ->color('info'),
            Stat::make('Female Drivers', PickAndDrop::query()->where('driver_gender', 'female')->distinct('user_id')->count('user_id'))
                ->description('Unique female drivers')
                ->descriptionIcon('heroicon-m-user')
                ->color('danger'),
            Stat::make('Chat Messages', Message::count())
                ->description('Total chat messages')
                ->descriptionIcon('heroicon-m-chat-bubble-left-right')
                ->color('primary'),
            Stat::make('Contact Interactions', ContactingStat::query()->sum('interaction_count'))
                ->description('Call, WhatsApp, and chat taps')
                ->descriptionIcon('heroicon-m-phone')
                ->color('success'),
        ];
    }
}
