@props([
    "active",
])

@php
    $classes =
        $active ?? false
            ? "flex h-10 items-center justify-start rounded-md bg-primary-50 px-3 py-2 font-semibold text-primary-500 hover:bg-gray-100 dark:bg-primary-500 dark:bg-opacity-20 dark:hover:bg-gray-800"
            : "flex h-10 items-center justify-start rounded-md px-3 py-2 font-semibold text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800";
@endphp

<a {{ $attributes->merge(["class" => $classes]) }}>
    {{ $slot }}
</a>
