<?php

namespace App\Http\Controllers\V1\Auth;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class LoginController
{
    public function login(LoginRequest $request): JsonResponse
    {
        $token = auth()->attempt($request->only('email', 'password'));

        if( !$token){
            return response()->json([
                'error' => 'Incorrect username or password',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return new JsonResponse(
            [
                'access_token' => $token,
                'type' => 'bearer',
                'expiry' => config('jwt.ttl'),
            ],
            Response::HTTP_OK,
        );
    }
}
