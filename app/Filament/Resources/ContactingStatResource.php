<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContactingStatResource\Pages;
use App\Models\ContactingStat;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ContactingStatResource extends Resource
{
    protected static ?string $model = ContactingStat::class;

    protected static ?string $navigationIcon = 'heroicon-o-phone';

    protected static ?string $navigationGroup = 'Analytics';

    protected static ?string $navigationLabel = 'Contact Stats';

    protected static ?string $modelLabel = 'Contact Stat';

    protected static ?string $pluralModelLabel = 'Contact Stats';

    public static function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('updated_at', 'desc')
            ->modifyQueryUsing(fn ($query) => $query->with(['user', 'recipientUser', 'pickAndDrop', 'rideRequest']))
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('User')
                    ->searchable()
                    ->sortable()
                    ->url(fn (ContactingStat $record): ?string => $record->user
                        ? UserResource::getUrl('edit', ['record' => $record->user])
                        : null
                    ),
                Tables\Columns\TextColumn::make('recipientUser.name')
                    ->label('Recipient')
                    ->searchable()
                    ->sortable()
                    ->url(fn (ContactingStat $record): ?string => $record->recipientUser
                        ? UserResource::getUrl('edit', ['record' => $record->recipientUser])
                        : null
                    ),
                Tables\Columns\TextColumn::make('contact_method')
                    ->label('Method')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => str($state)->headline()->toString())
                    ->color(fn (string $state): string => match ($state) {
                        'call' => 'success',
                        'whatsapp' => 'info',
                        'chat' => 'primary',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('contacted_listing_label')
                    ->label('Target')
                    ->badge()
                    ->color(fn (string $state): string => $state === 'Ride' ? 'warning' : 'danger'),
                Tables\Columns\TextColumn::make('contactable_id')
                    ->label('Listing ID')
                    ->sortable()
                    ->url(fn (ContactingStat $record): ?string => static::getContactableUrl($record)),
                Tables\Columns\TextColumn::make('contacted_route')
                    ->label('Route')
                    ->limit(40)
                    ->tooltip(fn (ContactingStat $record): ?string => $record->contacted_route)
                    ->url(fn (ContactingStat $record): ?string => static::getContactableUrl($record))
                    ->toggleable(),
                Tables\Columns\TextColumn::make('interaction_count')
                    ->label('Count')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Last Contact')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('contact_method')
                    ->label('Method')
                    ->options([
                        'call' => 'Call',
                        'whatsapp' => 'WhatsApp',
                        'chat' => 'Chat',
                    ]),
                Tables\Filters\SelectFilter::make('contactable_type')
                    ->label('Target')
                    ->options([
                        'pick_and_drop' => 'Ride',
                        'ride_request' => 'Ride Request',
                    ]),
            ])
            ->actions([])
            ->bulkActions([]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListContactingStats::route('/'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit($record): bool
    {
        return false;
    }

    public static function canDelete($record): bool
    {
        return false;
    }

    protected static function getContactableUrl(ContactingStat $record): ?string
    {
        return match ($record->contactable_type) {
            'pick_and_drop' => $record->pickAndDrop
                ? PickAndDropResource::getUrl('edit', ['record' => $record->pickAndDrop])
                : null,
            'ride_request' => $record->rideRequest
                ? RideRequestResource::getUrl('edit', ['record' => $record->rideRequest])
                : null,
            default => null,
        };
    }
}
