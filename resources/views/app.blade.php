<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'light') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "light" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                } else if (appearance === 'dark') {
                    document.documentElement.classList.add('dark');
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Asaancar') }}</title>

        {{-- SEO Meta Tags for Bots --}}
        @php
            $userAgent = request()->header('User-Agent', '');
            $isBot = $userAgent && (
                str_contains(strtolower($userAgent), 'facebookexternalhit') ||
                str_contains(strtolower($userAgent), 'facebot') ||
                str_contains(strtolower($userAgent), 'twitterbot') ||
                str_contains(strtolower($userAgent), 'linkedinbot') ||
                str_contains(strtolower($userAgent), 'whatsapp') ||
                str_contains(strtolower($userAgent), 'googlebot') ||
                str_contains(strtolower($userAgent), 'bingbot') ||
                str_contains(strtolower($userAgent), 'slackbot') ||
                str_contains(strtolower($userAgent), 'skypeuripreview') ||
                str_contains(strtolower($userAgent), 'applebot')
            );
            
            $metaTags = null;
            
            if ($isBot) {
                try {
                    $path = request()->path();
                    $baseUrl = request()->scheme() . '://' . request()->getHttpHost();
                    $pageUrl = $baseUrl . request()->getPathInfo();
                    $imageUrl = $baseUrl . (file_exists(public_path('logo.svg')) ? '/logo.svg' : '/icon.png');
                    
                    // Handle pick-and-drop detail pages
                    if (preg_match('#^pick-and-drop/(\d+)$#', $path, $matches)) {
                        $serviceId = (int) $matches[1];
                        $service = \App\Models\PickAndDrop::with(['user', 'stops'])
                            ->where('id', $serviceId)
                            ->where('is_active', true)
                            ->first();
                        
                        if ($service) {
                            $title = sprintf(
                                '%s → %s | Pick & Drop Service - Asaancar',
                                $service->start_location,
                                $service->end_location
                            );
                            
                            $descriptionParts = [];
                            $descriptionParts[] = sprintf('🚗 %s Driver Available', ucfirst($service->driver_gender));
                            $descriptionParts[] = sprintf('📍 Route: %s → %s', $service->start_location, $service->end_location);
                            $descriptionParts[] = sprintf('⏰ %s at %s', $service->is_everyday ? 'Everyday' : 'Scheduled', $service->departure_time);
                            $descriptionParts[] = sprintf('👥 %d Space%s Available', $service->available_spaces, $service->available_spaces !== 1 ? 's' : '');
                            
                            if ($service->price_per_person) {
                                $descriptionParts[] = sprintf('💰 %s %s per person', $service->currency, number_format($service->price_per_person, 0));
                            }
                            
                            if ($service->stops && $service->stops->count() > 0) {
                                $descriptionParts[] = sprintf('🛑 %d Stop%s Included', $service->stops->count(), $service->stops->count() !== 1 ? 's' : '');
                            }
                            
                            $description = implode(' • ', $descriptionParts);
                            $description .= ' | Book your ride on Asaancar - Pakistan\'s trusted ride sharing platform.';
                            
                            $metaTags = [
                                'title' => $title,
                                'description' => $description,
                                'image' => $imageUrl,
                                'url' => $pageUrl,
                                'type' => 'website',
                                'site_name' => 'Asaancar',
                            ];
                        }
                    }
                    // Handle pick-and-drop listing page
                    elseif (in_array($path, ['pick-and-drop', 'pick-and-drop/'], true)) {
                        $metaTags = [
                            'title' => 'Pick & Drop Services - Find Rides with Multiple Stops | Asaancar',
                            'description' => '🚗 Find convenient pick and drop services from location A to location B with multiple stops. 👥 Book rides with male or female drivers. 🔍 Search by start location, end location, departure time, and driver gender. 📍 Available in Karachi and across Pakistan. | Asaancar - Pakistan\'s trusted ride sharing platform.',
                            'image' => $imageUrl,
                            'url' => $pageUrl,
                            'type' => 'website',
                            'site_name' => 'Asaancar',
                        ];
                    }
                } catch (\Exception $e) {
                    // Silently fail - don't break the page if there's an error
                    $metaTags = null;
                }
            }
        @endphp
            
            @if($metaTags)
                <title>{{ $metaTags['title'] }}</title>
                <meta name="title" content="{{ $metaTags['title'] }}">
                <meta name="description" content="{{ $metaTags['description'] }}">
                <meta name="keywords" content="pick and drop, ride sharing, carpool, transportation, Pakistan, Karachi, ride booking, shared rides, daily commute">
                <meta name="robots" content="index, follow">
                <meta name="author" content="{{ $metaTags['site_name'] }}">
                
                <meta property="og:title" content="{{ $metaTags['title'] }}">
                <meta property="og:description" content="{{ $metaTags['description'] }}">
                <meta property="og:image" content="{{ $metaTags['image'] }}">
                <meta property="og:image:width" content="1200">
                <meta property="og:image:height" content="630">
                <meta property="og:image:alt" content="{{ $metaTags['title'] }}">
                <meta property="og:url" content="{{ $metaTags['url'] }}">
                <meta property="og:type" content="{{ $metaTags['type'] }}">
                <meta property="og:site_name" content="{{ $metaTags['site_name'] }}">
                <meta property="og:locale" content="en_US">
                
                <meta name="twitter:card" content="summary_large_image">
                <meta name="twitter:title" content="{{ $metaTags['title'] }}">
                <meta name="twitter:description" content="{{ $metaTags['description'] }}">
                <meta name="twitter:image" content="{{ $metaTags['image'] }}">
                <meta name="twitter:image:alt" content="{{ $metaTags['title'] }}">
                
                <link rel="canonical" href="{{ $metaTags['url'] }}">
            @endif

        <link rel="icon" href="/icon.png?v=2" sizes="any">
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
    </head>
    <body class="font-sans antialiased">
        <div id="app"></div>
    </body>
</html>
