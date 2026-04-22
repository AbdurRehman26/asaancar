@php
    /** @var \App\Models\ContactingStat $record */
    $record = $getRecord();

    $methodColorClasses = match ($record->contact_method) {
        'call' => 'bg-green-500/10 text-green-600 ring-green-600/20 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-400/20',
        'whatsapp' => 'bg-sky-500/10 text-sky-600 ring-sky-600/20 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/20',
        'chat' => 'bg-violet-500/10 text-violet-600 ring-violet-600/20 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-400/20',
        default => 'bg-gray-500/10 text-gray-600 ring-gray-600/20 dark:bg-gray-500/15 dark:text-gray-300 dark:ring-gray-400/20',
    };

    $targetColorClasses = $record->contacted_listing_label === 'Ride'
        ? 'bg-amber-500/10 text-amber-700 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20'
        : 'bg-rose-500/10 text-rose-700 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/20';
@endphp

<div class="w-full">
    <div class="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-semibold text-gray-950 dark:text-white">
                    {{ $record->user?->name ?? 'Unknown user' }}
                </span>
                <span class="text-xs text-gray-400 dark:text-gray-500">to</span>
                <span class="text-sm text-gray-600 dark:text-gray-300">
                    {{ $record->recipientUser?->name ?? 'Unknown recipient' }}
                </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset {{ $methodColorClasses }}">
                    {{ str($record->contact_method)->headline() }}
                </span>
                <span class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset {{ $targetColorClasses }}">
                    {{ $record->contacted_listing_label }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                    Listing #{{ $record->contactable_id }}
                </span>
            </div>
        </div>

        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 lg:justify-end">
            <div class="space-y-1">
                <p class="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Count</p>
                <p class="text-sm font-semibold text-gray-950 dark:text-white">{{ number_format($record->interaction_count) }}</p>
            </div>

            <div class="space-y-1">
                <p class="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Last Contact</p>
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ $record->updated_at?->format('M j, Y g:i A') }}</p>
            </div>
        </div>
    </div>
</div>
