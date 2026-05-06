<?php

namespace App\Filament\Widgets;

use App\Models\ContactingStat;
use App\Models\Message;
use App\Models\PickAndDrop;
use App\Models\RideRequest;
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
                ->description($this->todayDescription(User::query()->whereDate('created_at', today())->count()))
                ->descriptionIcon('heroicon-m-users')
                ->color('warning'),
            Stat::make('Expired OTP Users', User::query()
                ->whereNotNull('otp_code')
                ->whereNotNull('otp_expires_at')
                ->where('otp_expires_at', '<', now())
                ->count())
                ->description($this->todayDescription(User::query()
                    ->whereNotNull('otp_code')
                    ->whereNotNull('otp_expires_at')
                    ->where('otp_expires_at', '<', now())
                    ->whereDate('otp_expires_at', today())
                    ->count()))
                ->descriptionIcon('heroicon-m-clock')
                ->color('danger'),
            Stat::make('Manual Pick & Drop', PickAndDrop::query()->where('is_system_generated', false)->count())
                ->description($this->todayDescription(PickAndDrop::query()->where('is_system_generated', false)->whereDate('created_at', today())->count()))
                ->descriptionIcon('heroicon-m-map-pin')
                ->color('success'),
            Stat::make('Ride Requests', RideRequest::count())
                ->description($this->todayDescription(RideRequest::query()->whereDate('created_at', today())->count()))
                ->descriptionIcon('heroicon-m-map')
                ->color('primary'),
            Stat::make('Male Drivers', PickAndDrop::query()->where('driver_gender', 'male')->distinct('user_id')->count('user_id'))
                ->description($this->todayDescription(PickAndDrop::query()->where('driver_gender', 'male')->whereDate('created_at', today())->distinct('user_id')->count('user_id')))
                ->descriptionIcon('heroicon-m-user')
                ->color('info'),
            Stat::make('Female Drivers', PickAndDrop::query()->where('driver_gender', 'female')->distinct('user_id')->count('user_id'))
                ->description($this->todayDescription(PickAndDrop::query()->where('driver_gender', 'female')->whereDate('created_at', today())->distinct('user_id')->count('user_id')))
                ->descriptionIcon('heroicon-m-user')
                ->color('danger'),
            Stat::make('Chat Messages', Message::count())
                ->description($this->todayDescription(Message::query()->whereDate('created_at', today())->count()))
                ->descriptionIcon('heroicon-m-chat-bubble-left-right')
                ->color('primary'),
            Stat::make('Contact Interactions', ContactingStat::query()->sum('interaction_count'))
                ->description($this->todayDescription((int) ContactingStat::query()->whereDate('created_at', today())->sum('interaction_count')))
                ->descriptionIcon('heroicon-m-phone')
                ->color('success'),
        ];
    }

    private function todayDescription(int $count): string
    {
        return "Today: {$count}";
    }
}
