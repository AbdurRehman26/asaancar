<x-filament-panels::page>
    <div class="space-y-6">
        <x-filament::section>
            <div class="space-y-4">
                {{ $this->form }}

                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Select a ride or ride request, load its saved start and end addresses, then fetch Google address components like city, state, country, and postal code.
                </p>
            </div>
        </x-filament::section>

        @if ($selectedAddresses)
            <div class="grid gap-6 lg:grid-cols-2">
                <x-filament::section>
                    <x-slot name="heading">Start Address</x-slot>

                    <div class="space-y-2 text-sm">
                        <div>
                            <span class="font-medium text-gray-900 dark:text-white">Address:</span>
                            <span class="text-gray-600 dark:text-gray-300">{{ data_get($selectedAddresses, 'start_address') ?: 'Not available' }}</span>
                        </div>
                        <div>
                            <span class="font-medium text-gray-900 dark:text-white">Place ID:</span>
                            <span class="break-all text-gray-600 dark:text-gray-300">{{ data_get($selectedAddresses, 'start_place_id') ?: 'Not available' }}</span>
                        </div>
                    </div>
                </x-filament::section>

                <x-filament::section>
                    <x-slot name="heading">End Address</x-slot>

                    <div class="space-y-2 text-sm">
                        <div>
                            <span class="font-medium text-gray-900 dark:text-white">Address:</span>
                            <span class="text-gray-600 dark:text-gray-300">{{ data_get($selectedAddresses, 'end_address') ?: 'Not available' }}</span>
                        </div>
                        <div>
                            <span class="font-medium text-gray-900 dark:text-white">Place ID:</span>
                            <span class="break-all text-gray-600 dark:text-gray-300">{{ data_get($selectedAddresses, 'end_place_id') ?: 'Not available' }}</span>
                        </div>
                    </div>
                </x-filament::section>
            </div>
        @endif

        @if ($lookupResults)
            <x-filament::section>
                <x-slot name="heading">Area Field Mapping</x-slot>

                <div class="grid gap-6 lg:grid-cols-2">
                    <div class="space-y-2 rounded-xl border border-gray-200/70 bg-gray-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">Start Area</div>
                        <div class="text-sm text-gray-600 dark:text-gray-300">
                            Selected field:
                            <span class="font-medium text-gray-900 dark:text-white">
                                {{ $this->getAreaFieldOptions()[$startAreaField] ?? 'Not selected' }}
                            </span>
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-300">
                            Value to save:
                            <span class="font-medium text-gray-900 dark:text-white">
                                {{ $this->selectedAreaValue('start') ?? 'Not available' }}
                            </span>
                        </div>
                    </div>

                    <div class="space-y-2 rounded-xl border border-gray-200/70 bg-gray-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">End Area</div>
                        <div class="text-sm text-gray-600 dark:text-gray-300">
                            Selected field:
                            <span class="font-medium text-gray-900 dark:text-white">
                                {{ $this->getAreaFieldOptions()[$endAreaField] ?? 'Not selected' }}
                            </span>
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-300">
                            Value to save:
                            <span class="font-medium text-gray-900 dark:text-white">
                                {{ $this->selectedAreaValue('end') ?? 'Not available' }}
                            </span>
                        </div>
                    </div>
                </div>
            </x-filament::section>

            <div class="grid gap-6 lg:grid-cols-2">
                @foreach (['start' => 'Start Result', 'end' => 'End Result'] as $key => $heading)
                    @php($result = $lookupResults[$key] ?? null)

                    <x-filament::section>
                        <x-slot name="heading">{{ $heading }}</x-slot>

                        @if ($result)
                            <div class="space-y-4">
                                <div class="grid gap-3 md:grid-cols-2">
                                    @foreach ($result['components'] as $label => $value)
                                        <div class="rounded-xl border border-gray-200/70 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-white/5">
                                            <div class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                {{ str($label)->replace('_', ' ')->title() }}
                                            </div>
                                            <div class="mt-1 text-sm text-gray-900 dark:text-white">
                                                {{ $value ?: 'Not found' }}
                                            </div>
                                        </div>
                                    @endforeach
                                </div>

                                <div class="space-y-2 text-sm">
                                    <div>
                                        <span class="font-medium text-gray-900 dark:text-white">Formatted Address:</span>
                                        <span class="text-gray-600 dark:text-gray-300">{{ $result['formatted_address'] ?: 'Not available' }}</span>
                                    </div>
                                    <div>
                                        <span class="font-medium text-gray-900 dark:text-white">Coordinates:</span>
                                        <span class="text-gray-600 dark:text-gray-300">
                                            {{ $result['latitude'] ?? '—' }}, {{ $result['longitude'] ?? '—' }}
                                        </span>
                                    </div>
                                </div>

                                <div class="overflow-hidden rounded-xl border border-gray-200/70 dark:border-white/10">
                                    <table class="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                                        <thead class="bg-gray-50 dark:bg-white/5">
                                            <tr>
                                                <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Long Name</th>
                                                <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Short Name</th>
                                                <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Types</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-200 bg-white dark:divide-white/10 dark:bg-transparent">
                                            @foreach ($result['address_components'] as $component)
                                                <tr>
                                                    <td class="px-3 py-2 text-sm text-gray-900 dark:text-white">{{ $component['long_name'] }}</td>
                                                    <td class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">{{ $component['short_name'] }}</td>
                                                    <td class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">{{ implode(', ', $component['types']) }}</td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        @endif
                    </x-filament::section>
                @endforeach
            </div>
        @endif
    </div>
</x-filament-panels::page>
