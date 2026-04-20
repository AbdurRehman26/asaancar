<?php

namespace App\Filament\Resources;

use App\Filament\Resources\RideRequestResource\Pages;
use App\Models\RideRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class RideRequestResource extends Resource
{
    protected static ?string $model = RideRequest::class;

    protected static ?string $navigationIcon = 'heroicon-o-map';

    protected static ?string $navigationGroup = 'Services';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('User Information')
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->label('User')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\TextInput::make('name')
                            ->label('Requester Name')
                            ->maxLength(255)
                            ->nullable(),
                        Forms\Components\TextInput::make('contact')
                            ->label('Contact')
                            ->tel()
                            ->maxLength(255)
                            ->nullable(),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Route Information')
                    ->schema([
                        Forms\Components\TextInput::make('start_location')
                            ->label('Start Location')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('end_location')
                            ->label('End Location')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\DateTimePicker::make('departure_time')
                            ->label('Departure Time')
                            ->required()
                            ->native(false),
                        Forms\Components\Select::make('schedule_type')
                            ->label('Schedule Type')
                            ->options([
                                'once' => 'Once',
                                'everyday' => 'Everyday',
                                'weekdays' => 'Weekdays',
                                'weekends' => 'Weekends',
                                'custom' => 'Custom',
                            ])
                            ->default('once')
                            ->required()
                            ->reactive(),
                        Forms\Components\CheckboxList::make('selected_days')
                            ->label('Selected Days')
                            ->options([
                                'Monday' => 'Monday',
                                'Tuesday' => 'Tuesday',
                                'Wednesday' => 'Wednesday',
                                'Thursday' => 'Thursday',
                                'Friday' => 'Friday',
                                'Saturday' => 'Saturday',
                                'Sunday' => 'Sunday',
                            ])
                            ->columns(2)
                            ->visible(fn (Forms\Get $get): bool => $get('schedule_type') === 'custom'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Request Details')
                    ->schema([
                        Forms\Components\TextInput::make('required_seats')
                            ->label('Required Seats')
                            ->numeric()
                            ->minValue(1)
                            ->maxValue(4)
                            ->required(),
                        Forms\Components\Select::make('preferred_driver_gender')
                            ->label('Preferred Driver Gender')
                            ->options([
                                'male' => 'Male',
                                'female' => 'Female',
                                'any' => 'Any',
                            ])
                            ->default('any')
                            ->required(),
                        Forms\Components\TextInput::make('budget_per_seat')
                            ->label('Budget Per Seat')
                            ->numeric()
                            ->nullable(),
                        Forms\Components\Select::make('currency')
                            ->label('Currency')
                            ->options([
                                'PKR' => 'PKR',
                                'USD' => 'USD',
                                'EUR' => 'EUR',
                            ])
                            ->default('PKR')
                            ->required(),
                        Forms\Components\Toggle::make('is_roundtrip')
                            ->label('Round Trip')
                            ->default(false)
                            ->reactive(),
                        Forms\Components\TimePicker::make('return_time')
                            ->label('Return Time')
                            ->seconds(false)
                            ->visible(fn (Forms\Get $get): bool => (bool) $get('is_roundtrip'))
                            ->required(fn (Forms\Get $get): bool => (bool) $get('is_roundtrip')),
                        Forms\Components\Textarea::make('description')
                            ->label('Description')
                            ->rows(3)
                            ->maxLength(1000)
                            ->columnSpanFull()
                            ->nullable(),
                        Forms\Components\Toggle::make('is_active')
                            ->label('Active')
                            ->default(true),
                        Forms\Components\Toggle::make('is_system_generated')
                            ->label('System Generated')
                            ->default(false),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('User')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('start_location')
                    ->label('From')
                    ->searchable(),
                Tables\Columns\TextColumn::make('end_location')
                    ->label('To')
                    ->searchable(),
                Tables\Columns\TextColumn::make('departure_time')
                    ->label('Departure')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('required_seats')
                    ->label('Seats')
                    ->sortable(),
                Tables\Columns\TextColumn::make('preferred_driver_gender')
                    ->label('Driver')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'male' => 'info',
                        'female' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('budget_per_seat')
                    ->label('Budget')
                    ->money(fn (RideRequest $record): string => $record->currency ?: 'PKR')
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_roundtrip')
                    ->label('Round Trip')
                    ->boolean()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_system_generated')
                    ->label('System')
                    ->boolean()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('preferred_driver_gender')
                    ->label('Driver Preference')
                    ->options([
                        'male' => 'Male',
                        'female' => 'Female',
                        'any' => 'Any',
                    ]),
                Tables\Filters\SelectFilter::make('schedule_type')
                    ->options([
                        'once' => 'Once',
                        'everyday' => 'Everyday',
                        'weekdays' => 'Weekdays',
                        'weekends' => 'Weekends',
                        'custom' => 'Custom',
                    ]),
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRideRequests::route('/'),
            'create' => Pages\CreateRideRequest::route('/create'),
            'edit' => Pages\EditRideRequest::route('/{record}/edit'),
        ];
    }
}
