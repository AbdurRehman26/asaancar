<x-filament-panels::page>
    <div class="space-y-6">
        <x-filament::section>
            <div class="space-y-4">
                {{ $this->form }}

                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Test the pick and drop creation flow with a nested user object, automatic Pakistan phone formatting, and Google-backed place lookup for start and end locations.
                </p>
            </div>
        </x-filament::section>

        <x-filament::section>
            <x-slot name="heading">Response</x-slot>

            <div class="space-y-4">
                <div class="flex items-center justify-between gap-4">
                    <div class="text-sm text-gray-600 dark:text-gray-300">
                        {{ $responseMessage ?: 'Run the request to see the response.' }}
                    </div>

                    @if ($responseStatus)
                        <span
                            @class([
                                'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' => $responseStatus === 'success',
                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' => $responseStatus !== 'success',
                            ])
                        >
                            {{ str($responseStatus)->replace('_', ' ') }}
                        </span>
                    @endif
                </div>

                @if ($validationErrors)
                    <div class="rounded-xl border border-red-200/70 bg-red-50/80 p-4 dark:border-red-500/20 dark:bg-red-900/20">
                        <div class="text-sm font-medium text-red-700 dark:text-red-300">Validation Errors</div>
                        <pre class="mt-3 overflow-x-auto rounded-lg bg-gray-950 p-4 text-xs text-red-300">{{ json_encode($validationErrors, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) }}</pre>
                    </div>
                @elseif ($responsePayload)
                    <pre class="overflow-x-auto rounded-xl bg-gray-950 p-4 text-xs text-green-300">{{ json_encode($responsePayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) }}</pre>
                @else
                    <div class="rounded-xl border border-dashed border-gray-300/80 bg-gray-50/60 p-6 text-sm text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                        Response output will appear here after execution.
                    </div>
                @endif
            </div>
        </x-filament::section>
    </div>
</x-filament-panels::page>
