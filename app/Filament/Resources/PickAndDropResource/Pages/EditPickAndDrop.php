<?php

namespace App\Filament\Resources\PickAndDropResource\Pages;

use App\Filament\Resources\PickAndDropResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditPickAndDrop extends EditRecord
{
    protected static string $resource = PickAndDropResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
