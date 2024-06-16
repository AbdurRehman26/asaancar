<aside
    id="logo-sidebar"
    class="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white pt-20 transition-transform sm:translate-x-0 dark:border-gray-700 dark:bg-gray-800"
    aria-label="Sidebar"
>
    <div class="h-full overflow-y-auto bg-white px-3 pb-4 dark:bg-gray-800">
        <ul class="space-y-2 font-medium">
            <li x-data="">
                @include("layouts.partials.project-select")
            </li>
            {{--
                <li>
                <x-sidebar-link
                :href="route('dashboard')"
                :active="request()->routeIs('dashboard')"
                >
                <x-heroicon-o-home class="h-6 w-6" />
                <span class="ms-3">Dashboard</span>
                </x-sidebar-link>
                </li>
            --}}
            <li>
                <x-sidebar-link>
                    <x-heroicon-o-computer-desktop class="h-6 w-6" />
                    <span class="ms-3">Monitors</span>
                </x-sidebar-link>
            </li>
            <li>
                <x-sidebar-link>
                    <x-heroicon-o-globe-alt class="h-6 w-6" />
                    <span class="ms-3">Pages</span>
                </x-sidebar-link>
            </li>
            <li>
                <x-sidebar-link>
                    <x-heroicon-o-bell class="h-6 w-6" />
                    <span class="ms-3">Notifications</span>
                </x-sidebar-link>
            </li>
        </ul>
        <ul class="mt-4 space-y-2 border-t border-gray-200 pt-4 font-medium dark:border-gray-700">
            <li>
                <x-sidebar-link>
                    <x-heroicon-o-user-circle class="h-6 w-6" />
                    <span class="ms-3">Profile</span>
                </x-sidebar-link>
            </li>
            <li>
                <x-sidebar-link>
                    <x-heroicon-o-inbox-stack class="h-6 w-6" />
                    <span class="ms-3">Projects</span>
                </x-sidebar-link>
            </li>
            <li>
                <x-sidebar-link href="#">
                    <x-heroicon-o-credit-card class="h-6 w-6" />
                    <span class="ms-3">Subscription</span>
                </x-sidebar-link>
            </li>
        </ul>
    </div>
</aside>
