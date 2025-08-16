<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class VerifyEmailController extends Controller
{
    /**
     * Mark the user's email address as verified.
     */
    public function __invoke(Request $request, $id, $hash): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        // Verify the hash using Laravel's default email verification logic
        if (!hash_equals(sha1($user->email), $hash)) {
            return response()->json(['message' => 'Invalid verification link.'], 400);
        }

        if ($user->markEmailAsVerified()) {
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
