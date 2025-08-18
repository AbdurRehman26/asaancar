<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CarResource\Pages;
use App\Filament\Resources\CarResource\RelationManagers;
use App\Models\Car;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class CarResource extends Resource
{
    protected static ?string $model = Car::class;

    protected static ?string $navigationIcon = 'heroicon-o-truck';
    protected static ?string $navigationGroup = 'Car Management';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Car Information')
                    ->schema([
                        Forms\Components\Select::make('car_brand_id')
                            ->label('Brand')
                            ->relationship('carBrand', 'name')
                            ->searchable()
                            ->preload()
                            ->createOptionForm([
                                Forms\Components\TextInput::make('name')
                                    ->label('Brand Name')
                                    ->required()
                                    ->maxLength(255),
                            ])
                            ->createOptionUsing(function (array $data) {
                                return \App\Models\CarBrand::create($data);
                            })
                            ->required(),
                        Forms\Components\Select::make('car_type_id')
                            ->label('Type')
                            ->relationship('carType', 'name')
                            ->searchable()
                            ->preload()
                            ->createOptionForm([
                                Forms\Components\TextInput::make('name')
                                    ->label('Type Name')
                                    ->required()
                                    ->maxLength(255),
                            ])
                            ->createOptionUsing(function (array $data) {
                                return \App\Models\CarType::create($data);
                            })
                            ->required(),

                        Forms\Components\TextInput::make('model')
                            ->label('Model')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Select::make('year')
                            ->label('Year')
                            ->options(array_combine(range(1990, 2025), range(1990, 2025)))
                            ->required(),
                        Forms\Components\Select::make('color')
                            ->label('Color')
                            ->options([
                                'black' => 'Black',
                                'white' => 'White',
                                'gray' => 'Gray',
                                'silver' => 'Silver',
                                'red' => 'Red',
                                'blue' => 'Blue',
                                'green' => 'Green',
                                'yellow' => 'Yellow',
                                'orange' => 'Orange',
                                'brown' => 'Brown',
                                'other' => 'Other',
                            ])
                            ->searchable()
                            ->required(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Specifications')
                    ->schema([
                        Forms\Components\TextInput::make('seats')
                            ->label('Number of Seats')
                            ->numeric()
                            ->required()
                            ->minValue(1)
                            ->maxValue(20),
                        Forms\Components\Select::make('transmission')
                            ->label('Transmission')
                            ->options([
                                'manual' => 'Manual',
                                'automatic' => 'Automatic',
                            ])
                            ->required(),
                        Forms\Components\Select::make('fuel_type')
                            ->label('Fuel Type')
                            ->options([
                                'petrol' => 'Petrol',
                                'diesel' => 'Diesel',
                                'electric' => 'Electric',
                                'hybrid' => 'Hybrid',
                            ])
                            ->required(),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Store Information')
                    ->schema([
                        Forms\Components\Select::make('store_id')
                            ->label('Store')
                            ->relationship('store', 'name')
                            ->required()
                            ->searchable(),
                    ])
                    ->columns(1),

                Forms\Components\Section::make('Details')
                    ->schema([
                        Forms\Components\Textarea::make('description')
                            ->label('Description')
                            ->rows(3)
                            ->maxLength(1000),
                        Forms\Components\FileUpload::make('image_urls')
                            ->label('Car Images')
                            ->multiple()
                            ->image()
                            ->disk('s3')
                            ->directory('car-images'),
                    ])
                    ->columns(1),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Car Name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('carBrand.name')->label('Brand')->searchable(),
                Tables\Columns\TextColumn::make('carType.name')->label('Type')->searchable(),

                Tables\Columns\TextColumn::make('year')
                    ->label('Year')
                    ->sortable(),
                Tables\Columns\TextColumn::make('color')
                    ->label('Color')
                    ->searchable(),
                Tables\Columns\TextColumn::make('seats')
                    ->label('Seats')
                    ->sortable(),
                Tables\Columns\TextColumn::make('transmission')
                    ->label('Transmission')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'automatic' => 'success',
                        'manual' => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('fuel_type')
                    ->label('Fuel Type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'electric' => 'success',
                        'hybrid' => 'info',
                        'petrol' => 'warning',
                        'diesel' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('store.name')
                    ->label('Store')
                    ->searchable()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('transmission')
                    ->options([
                        'manual' => 'Manual',
                        'automatic' => 'Automatic',
                    ]),
                Tables\Filters\SelectFilter::make('fuel_type')
                    ->options([
                        'petrol' => 'Petrol',
                        'diesel' => 'Diesel',
                        'electric' => 'Electric',
                        'hybrid' => 'Hybrid',
                    ]),
                Tables\Filters\SelectFilter::make('store')
                    ->relationship('store', 'name')
                    ->label('Store'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\ViewAction::make(),
                Tables\Actions\Action::make('view_offers')
                    ->label('View Offers')
                    ->icon('heroicon-o-tag')
                    ->color('success')
                    ->url(fn (Car $record): string => "/car-detail/{$record->id}/edit")
                    ->openUrlInNewTab(),
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
            'index' => Pages\ListCars::route('/'),
            'create' => Pages\CreateCar::route('/create'),
            'edit' => Pages\EditCar::route('/{record}/edit'),
        ];
    }
}
