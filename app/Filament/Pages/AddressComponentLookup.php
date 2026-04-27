<?php

namespace App\Filament\Pages;

use App\Models\PickAndDrop;
use App\Models\RideRequest;
use App\Services\GoogleAddressComponentLookupService;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Database\Eloquent\Model;
use RuntimeException;

class AddressComponentLookup extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-map';

    protected static ?string $navigationGroup = 'Analytics';

    protected static ?string $navigationLabel = 'Address Components';

    protected static ?string $title = 'Address Component Lookup';

    protected static string $view = 'filament.pages.address-component-lookup';

    public ?string $sourceType = 'pick_and_drop';

    public ?string $recordId = null;

    public ?string $startAreaField = null;

    public ?string $endAreaField = null;

    /**
     * @var array{
     *     start_address: string|null,
     *     start_place_id: string|null,
     *     end_address: string|null,
     *     end_place_id: string|null
     * }|null
     */
    public ?array $selectedAddresses = null;

    /**
     * @var array{
     *     start: array<string, mixed>|null,
     *     end: array<string, mixed>|null
     * }|null
     */
    public ?array $lookupResults = null;

    public function mount(): void
    {
        $this->form->fill([
            'sourceType' => $this->sourceType,
            'recordId' => $this->recordId,
            'startAreaField' => $this->startAreaField,
            'endAreaField' => $this->endAreaField,
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Select::make('sourceType')
                    ->label('Source Type')
                    ->options([
                        'pick_and_drop' => 'Pick & Drop',
                        'ride_request' => 'Ride Request',
                    ])
                    ->live()
                    ->afterStateUpdated(function (): void {
                        $this->recordId = null;
                        $this->selectedAddresses = null;
                        $this->lookupResults = null;
                    })
                    ->required(),
                Select::make('recordId')
                    ->label('Record')
                    ->options(fn (): array => $this->getAvailableRecordOptions())
                    ->searchable()
                    ->getSearchResultsUsing(fn (string $search): array => $this->getRecordOptions($search))
                    ->getOptionLabelUsing(fn ($value): ?string => $this->getRecordLabel($value))
                    ->required(),
                Select::make('startAreaField')
                    ->label('Start Area Response Field')
                    ->options($this->getAreaFieldOptions())
                    ->live(),
                Select::make('endAreaField')
                    ->label('End Area Response Field')
                    ->options($this->getAreaFieldOptions())
                    ->live(),
                TextInput::make('selectedAddresses.start_address')
                    ->label('Start Address')
                    ->disabled()
                    ->dehydrated(false),
                TextInput::make('selectedAddresses.end_address')
                    ->label('End Address')
                    ->disabled()
                    ->dehydrated(false),
            ])
            ->columns(2)
            ->statePath('');
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('loadAddresses')
                ->label('Load Addresses')
                ->action('loadAddresses'),
            Action::make('lookupComponents')
                ->label('Lookup Components')
                ->color('primary')
                ->action('lookupComponents')
                ->requiresConfirmation(false),
            Action::make('saveSelectedAreaFields')
                ->label('Save Selected Area Fields')
                ->color('success')
                ->action('saveSelectedAreaFields')
                ->requiresConfirmation(false),
        ];
    }

    public function loadAddresses(): void
    {
        $this->selectedAddresses = $this->resolveSelectedAddresses();
        $this->lookupResults = null;
    }

    public function lookupComponents(GoogleAddressComponentLookupService $lookupService): void
    {
        try {
            $addresses = $this->resolveSelectedAddresses();

            $this->selectedAddresses = $addresses;
            $this->lookupResults = [
                'start' => $lookupService->lookup([
                    'address' => $addresses['start_address'] ?? '',
                    'place_id' => $addresses['start_place_id'] ?? null,
                ]),
                'end' => $lookupService->lookup([
                    'address' => $addresses['end_address'] ?? '',
                    'place_id' => $addresses['end_place_id'] ?? null,
                ]),
            ];
            $this->startAreaField ??= $this->determineDefaultAreaField($this->lookupResults['start']);
            $this->endAreaField ??= $this->determineDefaultAreaField($this->lookupResults['end']);
        } catch (RuntimeException $exception) {
            Notification::make()
                ->title('Lookup failed')
                ->body($exception->getMessage())
                ->danger()
                ->send();
        }
    }

    public function saveSelectedAreaFields(): void
    {
        try {
            if ($this->lookupResults === null) {
                throw new RuntimeException('Please run the lookup first.');
            }

            $record = $this->resolveSelectedRecord();

            $record->forceFill([
                'start_area' => $this->requiredSelectedAreaValue('start'),
                'end_area' => $this->requiredSelectedAreaValue('end'),
            ])->save();

            Notification::make()
                ->title('Area fields saved')
                ->body('The selected start and end area values were saved successfully.')
                ->success()
                ->send();
        } catch (RuntimeException $exception) {
            Notification::make()
                ->title('Save failed')
                ->body($exception->getMessage())
                ->danger()
                ->send();
        }
    }

    /**
     * @return array<string, string>
     */
    public function getAvailableRecordOptions(): array
    {
        return $this->getRecordOptions();
    }

    /**
     * @return array<string, string>
     */
    protected function getRecordOptions(string $search = ''): array
    {
        $query = $this->recordQuery()->latest();

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                $builder
                    ->where('start_location', 'like', '%'.$search.'%')
                    ->orWhere('end_location', 'like', '%'.$search.'%');
            });
        }

        $records = $query->get();

        return $records
            ->mapWithKeys(fn (Model $record): array => [$record->getKey() => $this->formatRecordLabel($record)])
            ->all();
    }

    protected function getRecordLabel(mixed $value): ?string
    {
        if (! $value) {
            return null;
        }

        $record = $this->recordQuery()->find($value);

        return $record ? $this->formatRecordLabel($record) : null;
    }

    protected function formatRecordLabel(Model $record): string
    {
        /** @var string|null $start */
        $start = $record->getAttribute('start_location');
        /** @var string|null $end */
        $end = $record->getAttribute('end_location');

        return '#'.$record->getKey().' - '.$start.' -> '.$end;
    }

    /**
     * @return array<string, string>
     */
    public function getAreaFieldOptions(): array
    {
        return [
            'formatted_address' => 'Formatted Address',
            'street_number' => 'Street Number',
            'route' => 'Route',
            'neighborhood' => 'Neighborhood',
            'sublocality' => 'Sublocality',
            'city' => 'City',
            'state' => 'State',
            'country' => 'Country',
            'postal_code' => 'Postal Code',
        ];
    }

    protected function recordQuery()
    {
        return match ($this->sourceType) {
            'ride_request' => RideRequest::query(),
            default => PickAndDrop::query(),
        };
    }

    protected function resolveSelectedRecord(): Model
    {
        if (! filled($this->recordId)) {
            throw new RuntimeException('Please select a record first.');
        }

        $record = $this->recordQuery()->find($this->recordId);

        if (! $record) {
            throw new RuntimeException('The selected record could not be found.');
        }

        return $record;
    }

    /**
     * @return array{
     *     start_address: string|null,
     *     start_place_id: string|null,
     *     end_address: string|null,
     *     end_place_id: string|null
     * }
     */
    protected function resolveSelectedAddresses(): array
    {
        $record = $this->resolveSelectedRecord();

        return [
            'start_address' => $record->getAttribute('start_location'),
            'start_place_id' => $record->getAttribute('start_place_id'),
            'end_address' => $record->getAttribute('end_location'),
            'end_place_id' => $record->getAttribute('end_place_id'),
        ];
    }

    /**
     * @param  array<string, mixed>|null  $lookupResult
     */
    protected function determineDefaultAreaField(?array $lookupResult): ?string
    {
        if ($lookupResult === null) {
            return null;
        }

        foreach (['neighborhood', 'sublocality', 'route', 'city', 'state', 'country', 'postal_code', 'street_number'] as $field) {
            if (filled(data_get($lookupResult, 'components.'.$field))) {
                return $field;
            }
        }

        return filled(data_get($lookupResult, 'formatted_address')) ? 'formatted_address' : null;
    }

    public function selectedAreaValue(string $prefix): ?string
    {
        $lookupResult = $this->lookupResults[$prefix] ?? null;
        $field = $prefix === 'start' ? $this->startAreaField : $this->endAreaField;

        if ($lookupResult === null || ! filled($field)) {
            return null;
        }

        if ($field === 'formatted_address') {
            return data_get($lookupResult, 'formatted_address');
        }

        return data_get($lookupResult, 'components.'.$field);
    }

    protected function requiredSelectedAreaValue(string $prefix): ?string
    {
        $value = $this->selectedAreaValue($prefix);

        if (! filled($value)) {
            throw new RuntimeException('Please select a response field that has a value to save.');
        }

        return $value;
    }
}
