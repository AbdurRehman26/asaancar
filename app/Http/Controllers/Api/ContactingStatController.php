<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactingStatRequest;
use App\Models\ContactingStat;
use App\Models\PickAndDrop;
use App\Models\RideRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ContactingStatController extends Controller
{
    public function store(StoreContactingStatRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $contactable = match ($validated['contactable_type']) {
            'pick_and_drop' => PickAndDrop::query()->find($validated['contactable_id']),
            'ride_request' => RideRequest::query()->find($validated['contactable_id']),
            default => null,
        };

        if ($contactable === null) {
            throw ValidationException::withMessages([
                'contactable_id' => ['The selected contact target is invalid.'],
            ]);
        }

        if ((int) $contactable->user_id !== (int) $validated['recipient_user_id']) {
            throw ValidationException::withMessages([
                'recipient_user_id' => ['The selected recipient does not match the contacted listing.'],
            ]);
        }

        $attributes = [
            'user_id' => (int) $request->user()->id,
            'recipient_user_id' => (int) $validated['recipient_user_id'],
            'contactable_type' => $validated['contactable_type'],
            'contactable_id' => (int) $validated['contactable_id'],
            'contact_method' => $validated['contact_method'],
        ];

        $contactingStat = ContactingStat::query()->firstOrCreate($attributes, [
            'interaction_count' => 0,
        ]);

        $contactingStat->increment('interaction_count');
        $contactingStat->refresh();

        return response()->json([
            'data' => [
                'id' => $contactingStat->id,
                'interaction_count' => $contactingStat->interaction_count,
            ],
        ]);
    }
}
