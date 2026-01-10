<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PickAndDropResource\Pages;
use App\Filament\Resources\PickAndDropResource\RelationManagers;
use App\Models\PickAndDrop;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class PickAndDropResource extends Resource
{
    protected static ?string $model = PickAndDrop::class;

    protected static ?string $navigationIcon = 'heroicon-o-map-pin';
    protected static ?string $navigationGroup = 'Services';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('User & Car Information')
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->label('User')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->required(),
                        Forms\Components\Select::make('car_id')
                            ->label('Car (Optional)')
                            ->relationship('car', 'name')
                            ->searchable()
                            ->nullable(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Route Information')
                    ->schema([
                        Forms\Components\TextInput::make('start_location')
                            ->label('Start Location')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Select::make('pickup_city_id')
                            ->label('Start City (Optional)')
                            ->relationship('pickupCity', 'name')
                            ->searchable()
                            ->nullable()
                            ->reactive()
                            ->afterStateUpdated(fn (callable $set) => $set('pickup_area_id', null)),
                        Forms\Components\Select::make('pickup_area_id')
                            ->label('Start Area (Optional)')
                            ->relationship('pickupArea', 'name', fn ($query, $get) => 
                                $query->where('city_id', $get('pickup_city_id'))
                            )
                            ->searchable()
                            ->nullable(),
                        Forms\Components\TextInput::make('end_location')
                            ->label('End Location')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Select::make('dropoff_city_id')
                            ->label('End City (Optional)')
                            ->relationship('dropoffCity', 'name')
                            ->searchable()
                            ->nullable()
                            ->reactive()
                            ->afterStateUpdated(fn (callable $set) => $set('dropoff_area_id', null)),
                        Forms\Components\Select::make('dropoff_area_id')
                            ->label('End Area (Optional)')
                            ->relationship('dropoffArea', 'name', fn ($query, $get) => 
                                $query->where('city_id', $get('dropoff_city_id'))
                            )
                            ->searchable()
                            ->nullable(),
                        Forms\Components\DateTimePicker::make('departure_time')
                            ->label('Departure Time')
                            ->required()
                            ->native(false),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Car Details')
                    ->schema([
                        Forms\Components\TextInput::make('car_brand')
                            ->label('Car Brand')
                            ->maxLength(255)
                            ->nullable(),
                        Forms\Components\TextInput::make('car_model')
                            ->label('Car Model')
                            ->maxLength(255)
                            ->nullable(),
                        Forms\Components\TextInput::make('car_color')
                            ->label('Car Color')
                            ->maxLength(255)
                            ->nullable(),
                        Forms\Components\TextInput::make('car_seats')
                            ->label('Car Seats')
                            ->numeric()
                            ->nullable(),
                        Forms\Components\Select::make('car_transmission')
                            ->label('Transmission')
                            ->options([
                                'manual' => 'Manual',
                                'automatic' => 'Automatic',
                            ])
                            ->nullable(),
                        Forms\Components\Select::make('car_fuel_type')
                            ->label('Fuel Type')
                            ->options([
                                'petrol' => 'Petrol',
                                'diesel' => 'Diesel',
                                'electric' => 'Electric',
                                'hybrid' => 'Hybrid',
                            ])
                            ->nullable(),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Service Details')
                    ->schema([
                        Forms\Components\TextInput::make('available_spaces')
                            ->label('Available Spaces')
                            ->numeric()
                            ->required()
                            ->minValue(1),
                        Forms\Components\Select::make('driver_gender')
                            ->label('Driver Gender')
                            ->options([
                                'male' => 'Male',
                                'female' => 'Female',
                            ])
                            ->required()
                            ->default('male'),
                        Forms\Components\Toggle::make('is_roundtrip')
                            ->label('Round Trip')
                            ->default(false)
                            ->reactive(),
                        Forms\Components\TimePicker::make('return_time')
                            ->label('Return Time')
                            ->visible(fn ($get) => $get('is_roundtrip'))
                            ->required(fn ($get) => $get('is_roundtrip')),
                        Forms\Components\Textarea::make('description')
                            ->label('Description')
                            ->rows(3)
                            ->maxLength(1000)
                            ->nullable(),
                        Forms\Components\TextInput::make('price_per_person')
                            ->label('Price Per Person')
                            ->numeric()
                            ->nullable(),
                        Forms\Components\Select::make('currency')
                            ->label('Currency')
                            ->options([
                                'PKR' => 'PKR',
                                'USD' => 'USD',
                                'EUR' => 'EUR',
                            ])
                            ->default('PKR'),
                        Forms\Components\Toggle::make('is_active')
                            ->label('Active')
                            ->default(true),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Stops')
                    ->schema([
                        Forms\Components\Repeater::make('stops')
                            ->relationship('stops')
                            ->schema([
                                Forms\Components\TextInput::make('location')
                                    ->label('Location (Optional)')
                                    ->maxLength(255)
                                    ->nullable(),
                                Forms\Components\Select::make('city_id')
                                    ->label('City (Optional)')
                                    ->relationship('city', 'name')
                                    ->searchable()
                                    ->nullable()
                                    ->reactive()
                                    ->afterStateUpdated(fn (callable $set) => $set('area_id', null)),
                                Forms\Components\Select::make('area_id')
                                    ->label('Area (Optional)')
                                    ->relationship('area', 'name', fn ($query, $get) => 
                                        $query->where('city_id', $get('city_id'))
                                    )
                                    ->searchable()
                                    ->nullable(),
                                Forms\Components\DateTimePicker::make('stop_time')
                                    ->label('Stop Time')
                                    ->required()
                                    ->native(false),
                                Forms\Components\TextInput::make('order')
                                    ->label('Order')
                                    ->numeric()
                                    ->default(0)
                                    ->required(),
                                Forms\Components\Textarea::make('notes')
                                    ->label('Notes')
                                    ->rows(2)
                                    ->nullable(),
                            ])
                            ->columns(2)
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => 
                                $state['location'] ?? 
                                ($state['area_id'] ? 'Area' : ($state['city_id'] ? 'City' : 'Stop'))
                            ),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
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
                Tables\Columns\TextColumn::make('available_spaces')
                    ->label('Spaces')
                    ->sortable(),
                Tables\Columns\TextColumn::make('driver_gender')
                    ->label('Driver')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'male' => 'info',
                        'female' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('price_per_person')
                    ->label('Price')
                    ->money('currency')
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_roundtrip')
                    ->label('Round Trip')
                    ->boolean()
                    ->sortable(),
                Tables\Columns\TextColumn::make('stops_count')
                    ->label('Stops')
                    ->counts('stops'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('driver_gender')
                    ->options([
                        'male' => 'Male',
                        'female' => 'Female',
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
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPickAndDrops::route('/'),
            'create' => Pages\CreatePickAndDrop::route('/create'),
            'edit' => Pages\EditPickAndDrop::route('/{record}/edit'),
        ];
    }
}
