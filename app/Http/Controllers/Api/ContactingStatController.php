<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactingStatRequest;
use App\Models\ContactingStat;
use App\Models\PickAndDrop;
use App\Models\RideRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

/**
 * @OA\Tag(
 *     name="Contact Stats",
 *     description="API Endpoints for tracking contact actions"
 * )
 */
class ContactingStatController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/contacting-stats",
     *     operationId="storeContactingStat",
     *     tags={"Contact Stats"},
     *     summary="Record a contact interaction",
     *     description="Create or increment a contact stat when a user taps call, WhatsApp, or chat on a ride or ride request",
     *     security={{"sanctum": {}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"recipient_user_id", "contactable_type", "contactable_id", "contact_method"},
     *
     *             @OA\Property(property="recipient_user_id", type="integer", example=44),
     *             @OA\Property(property="contactable_type", type="string", enum={"pick_and_drop", "ride_request"}, example="pick_and_drop"),
     *             @OA\Property(property="contactable_id", type="integer", example=17),
     *             @OA\Property(property="contact_method", type="string", enum={"call", "whatsapp", "chat"}, example="whatsapp")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Contact interaction recorded successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="interaction_count", type="integer", example=3)
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
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
