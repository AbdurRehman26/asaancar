<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContactingStatResource\Pages;
use App\Models\ContactingStat;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\Layout\Panel;
use Filament\Tables\Columns\ViewColumn;
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
                ViewColumn::make('summary')
                    ->view('filament.tables.columns.contacting-stat-summary'),
                Panel::make([
                    Tables\Columns\TextColumn::make('contacted_listing_label')
                        ->label('Contacted On')
                        ->badge()
                        ->color(fn (string $state): string => $state === 'Ride' ? 'warning' : 'danger'),
                    Tables\Columns\TextColumn::make('contacted_route')
                        ->label('Route')
                        ->wrap()
                        ->placeholder('Listing details unavailable'),
                    Tables\Columns\TextColumn::make('contacted_departure')
                        ->label('Departure')
                        ->placeholder('No departure time'),
                    Tables\Columns\TextColumn::make('contacted_schedule')
                        ->label('Schedule')
                        ->placeholder('No schedule'),
                    Tables\Columns\TextColumn::make('contacted_price_summary')
                        ->label('Price / Budget')
                        ->placeholder('Not set'),
                ])
                    ->collapsible()
                    ->collapsed(),
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
}
