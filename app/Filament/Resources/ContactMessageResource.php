<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContactMessageResource\Pages;
use App\Models\ContactMessage;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ContactMessageResource extends Resource
{
    private const DEFAULT_WHATSAPP_MESSAGE = 'Hi this is Kazmi from Asaancar, I see you contacted on our website, How may I help you';

    protected static ?string $model = ContactMessage::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static ?string $navigationGroup = 'Communication';

    protected static ?string $navigationLabel = 'Inquiries';

    protected static ?string $modelLabel = 'Inquiry';

    protected static ?string $pluralModelLabel = 'Inquiries';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('contact_info')
                    ->label('Contact')
                    ->searchable()
                    ->sortable()
                    ->url(fn (ContactMessage $record): ?string => static::whatsAppUrl($record->contact_info))
                    ->openUrlInNewTab(),
                Tables\Columns\TextColumn::make('message')
                    ->label('Message')
                    ->searchable()
                    ->wrap()
                    ->limit(90)
                    ->tooltip(fn (ContactMessage $record): string => $record->message),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Submitted')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\Filter::make('today')
                    ->label('Today')
                    ->query(fn ($query) => $query->whereDate('created_at', today())),
            ])
            ->actions([])
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
            'index' => Pages\ListContactMessages::route('/'),
        ];
    }

    public static function whatsAppUrl(?string $contactInfo): ?string
    {
        $formattedNumber = static::formatPakistaniWhatsAppNumber($contactInfo);

        if ($formattedNumber === null) {
            return null;
        }

        return 'https://wa.me/'.ltrim($formattedNumber, '+').'?text='.urlencode(static::DEFAULT_WHATSAPP_MESSAGE);
    }

    public static function formatPakistaniWhatsAppNumber(?string $contactInfo): ?string
    {
        if (! filled($contactInfo)) {
            return null;
        }

        $trimmedContact = trim($contactInfo);

        if (filter_var($trimmedContact, FILTER_VALIDATE_EMAIL)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $trimmedContact);

        if ($digits === '') {
            return null;
        }

        if (str_starts_with($digits, '0092')) {
            return '+'.substr($digits, 2);
        }

        if (str_starts_with($digits, '92')) {
            return '+'.$digits;
        }

        if (str_starts_with($digits, '0')) {
            return '+92'.substr($digits, 1);
        }

        return '+92'.ltrim($digits, '0');
    }
}
