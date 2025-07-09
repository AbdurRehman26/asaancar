<?php

namespace App\Filament\Resources\CarEngineResource\Pages;

use App\Filament\Resources\CarEngineResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCarEngines extends ListRecords
{
    protected static string $resource = CarEngineResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
