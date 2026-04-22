<?php

namespace App\Filament\Resources\ContactingStatResource\Pages;

use App\Filament\Resources\ContactingStatResource;
use Filament\Resources\Pages\ListRecords;

class ListContactingStats extends ListRecords
{
    protected static string $resource = ContactingStatResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
