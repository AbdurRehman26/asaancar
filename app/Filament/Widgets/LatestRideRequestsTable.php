<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\RideRequestResource;
use App\Models\RideRequest;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class LatestRideRequestsTable extends TableWidget
{
    protected static bool $isLazy = false;

    protected static ?int $sort = 21;

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->heading('Latest Ride Requests')
            ->query(
                RideRequest::query()
                    ->with('user')
                    ->latest('created_at')
                    ->limit(10),
            )
            ->defaultPaginationPageOption(10)
            ->paginated([10])
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('User')
                    ->searchable(),
                Tables\Columns\TextColumn::make('start_location')
                    ->label('From')
                    ->limit(30)
                    ->searchable(),
                Tables\Columns\TextColumn::make('end_location')
                    ->label('To')
                    ->limit(30)
                    ->searchable(),
                Tables\Columns\TextColumn::make('preferred_driver_gender')
                    ->label('Driver')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'male' => 'info',
                        'female' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('required_seats')
                    ->label('Seats'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->since(),
            ])
            ->actions([
                Tables\Actions\Action::make('edit')
                    ->label('Edit')
                    ->icon('heroicon-m-pencil-square')
                    ->url(fn (RideRequest $record): string => RideRequestResource::getUrl('edit', ['record' => $record])),
            ]);
    }
}
