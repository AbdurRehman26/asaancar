<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        if ($request->user()->markEmailAsVerified()) {
            /** @var \Illuminate\Contracts\Auth\MustVerifyEmail $user */
            $user = $request->user();
            event(new Verified($user));
            return response()->json(['message' => 'Email verified successfully.']);
        }

        return response()->json(['message' => 'Unable to verify email.'], 400);
    }

    protected function redirectAfterVerification($user): RedirectResponse
    {
        if ($user->hasRole('store_owner') && (!$user->store_id && $user->stores()->count() === 0)) {
            return redirect('/create-store?verified=1');
        }
        return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
    }
}
