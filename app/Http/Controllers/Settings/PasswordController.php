<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request)
    {
        $user = $request->user();
        
        // If user has a password, require current_password validation
        // If user doesn't have a password (OTP user), current_password is optional
        $rules = [
            'password' => ['required', Password::defaults(), 'confirmed'],
        ];
        
        if ($user->password) {
            // User has a password, so current_password is required
            $rules['current_password'] = ['required', 'current_password'];
        } else {
            // User doesn't have a password, current_password is optional
            $rules['current_password'] = ['nullable'];
        }
        
        $validated = $request->validate($rules);
        
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);
        
        return response()->json(['message' => 'Password updated successfully.']);
    }
}
