<?php

namespace App\Filament\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeFilamentNotifications
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->hasSession()) {
            $notifications = $request->session()->get('filament.notifications');

            if ($notifications !== null) {
                if (! is_array($notifications)) {
                    $request->session()->forget('filament.notifications');
                } else {
                    $sanitizedNotifications = array_values(array_filter(
                        $notifications,
                        fn (mixed $notification): bool => is_array($notification),
                    ));

                    $request->session()->put('filament.notifications', $sanitizedNotifications);
                }
            }
        }

        return $next($request);
    }
}
