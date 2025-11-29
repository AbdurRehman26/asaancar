<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * @OA\Tag(
 *     name="Authentication",
 *     description="API Endpoints for user authentication"
 * )
 */
class ConfirmablePasswordController extends Controller
{
    /**
     * Show the confirm password page.
     */
    public function show(): Response
    {
        return Inertia::render('auth/confirm-password');
    }

    /**
     * @OA\Post(
     *     path="/api/confirm-password",
     *     operationId="confirmPassword",
     *     tags={"Authentication"},
     *     summary="Confirm password",
     *     description="Confirm the user's password before sensitive operations",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"password"},
     *             @OA\Property(property="password", type="string", format="password", example="currentpassword")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Password confirmed",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Password confirmed.")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Invalid password")
     * )
     * Confirm the user's password.
     */
    public function store(Request $request)
    {
        if (! Auth::guard('web')->validate([
            'email' => $request->user()->email,
            'password' => $request->password,
        ])) {
            return response()->json(['message' => __('auth.password')], 422);
        }

        // For API, just return a JSON message
        return response()->json(['message' => 'Password confirmed.']);
    }
}
