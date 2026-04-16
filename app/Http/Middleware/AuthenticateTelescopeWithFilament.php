<?php

namespace App\Http\Middleware;

use Closure;
use Filament\Facades\Filament;
use Filament\Models\Contracts\FilamentUser;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AuthenticateTelescopeWithFilament
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $panel = Filament::getPanel('admin');

        Filament::setCurrentPanel($panel);

        $guard = Filament::auth();

        if (! $guard->check()) {
            return redirect()->route('filament.admin.auth.login');
        }

        $user = $guard->user();

        if (! $user instanceof FilamentUser || ! $user->canAccessPanel($panel)) {
            throw new HttpException(403);
        }

        return $next($request);
    }
}
