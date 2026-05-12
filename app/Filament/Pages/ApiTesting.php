<?php

namespace App\Filament\Pages;

use App\Services\AdminPickAndDropTestingService;
use App\Services\GoogleAddressComponentLookupService;
use Filament\Actions\Action;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Validation\ValidationException;
use JsonException;

class ApiTesting extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-command-line';

    protected static ?string $navigationGroup = 'Utilities';

    protected static ?string $navigationLabel = 'API Testing';

    protected static ?string $title = 'API Testing';

    protected static string $view = 'filament.pages.api-testing';

    public string $apiType = 'pick_and_drop';

    public string $payloadJson = '{}';

    /**
     * @var array<string, mixed>|null
     */
    public ?array $responsePayload = null;

    public ?string $responseStatus = null;

    public ?string $responseMessage = null;

    /**
     * @var array<string, array<int, string>>|null
     */
    public ?array $validationErrors = null;

    public function mount(AdminPickAndDropTestingService $pickAndDropTestingService): void
    {
        $this->payloadJson = $this->encodePrettyJson($pickAndDropTestingService->template());

        $this->form->fill([
            'payloadJson' => $this->payloadJson,
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Textarea::make('payloadJson')
                    ->label('JSON Payload')
                    ->rows(18)
                    ->required(),
            ])
            ->statePath('');
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('loadTemplate')
                ->label('Load Template')
                ->action('loadTemplate'),
            Action::make('executeRequest')
                ->label('Execute Request')
                ->color('primary')
                ->action('executeRequest'),
        ];
    }

    public function loadTemplate(AdminPickAndDropTestingService $pickAndDropTestingService): void
    {
        $this->payloadJson = $this->encodePrettyJson($pickAndDropTestingService->template());
        $this->resetResponse();
    }

    public function executeRequest(
        AdminPickAndDropTestingService $pickAndDropTestingService,
        GoogleAddressComponentLookupService $lookupService,
    ): void {
        $this->resetResponse();

        try {
            $decodedPayload = json_decode($this->payloadJson, true, 512, JSON_THROW_ON_ERROR);

            if (! is_array($decodedPayload)) {
                throw new JsonException('The payload must decode to a JSON object.');
            }

            $result = $pickAndDropTestingService->execute($decodedPayload, $lookupService);

            $this->responsePayload = [
                'success' => true,
                'message' => $result['message'],
                'data' => $result['data']->toArray(),
            ];
            $this->responseStatus = 'success';
            $this->responseMessage = $result['message'];

            Notification::make()
                ->title('API request executed')
                ->body($result['message'])
                ->success()
                ->send();
        } catch (ValidationException $exception) {
            $this->responseStatus = 'validation_error';
            $this->responseMessage = 'Validation failed';
            $this->validationErrors = $exception->errors();

            Notification::make()
                ->title('Validation failed')
                ->body('Please review the payload errors below.')
                ->danger()
                ->send();
        } catch (JsonException $exception) {
            $this->responseStatus = 'error';
            $this->responseMessage = 'Invalid JSON format: '.$exception->getMessage();

            Notification::make()
                ->title('Invalid JSON')
                ->body($exception->getMessage())
                ->danger()
                ->send();
        } catch (\Throwable $exception) {
            $this->responseStatus = 'error';
            $this->responseMessage = $exception->getMessage();

            Notification::make()
                ->title('Execution failed')
                ->body($exception->getMessage())
                ->danger()
                ->send();
        }
    }

    private function resetResponse(): void
    {
        $this->responsePayload = null;
        $this->responseStatus = null;
        $this->responseMessage = null;
        $this->validationErrors = null;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function encodePrettyJson(array $payload): string
    {
        try {
            return json_encode($payload, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return '{}';
        }
    }
}
