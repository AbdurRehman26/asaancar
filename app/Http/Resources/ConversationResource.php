<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'user_id' => $this->user_id,
            'user' => new UserResource($this->user),
            'recipient_user_id' => $this->recipient_user_id,
            'pick_and_drop_service_id' => $this->pick_and_drop_service_id,
            'ride_request_id' => $this->ride_request_id,
            'last_message' => $this->lastMessage ? $this->lastMessage->message : null,
            'unread_count' => $this->unread_count ?? 0,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
            'formatted_time' => $this->updated_at ? $this->formatConversationTime($this->updated_at) : null,
            'recipientUser' => $this->recipientUserPayload(),
            'pickAndDropService' => $this->pickAndDropServicePayload(),
            'rideRequest' => $this->rideRequestPayload(),
            'typeObject' => $this->typeObjectPayload(),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function recipientUserPayload(): ?array
    {
        if (! $this->relationLoaded('recipientUser') || ! $this->recipientUser) {
            return null;
        }

        return [
            'id' => $this->recipientUser->id,
            'name' => $this->recipientUser->name,
            'email' => $this->recipientUser->email,
            'phone' => $this->recipientUser->phone,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function pickAndDropServicePayload(): ?array
    {
        if (! $this->relationLoaded('pickAndDropService') || ! $this->pickAndDropService) {
            return null;
        }

        return [
            'id' => $this->pickAndDropService->id,
            'start_location' => $this->pickAndDropService->start_location,
            'end_location' => $this->pickAndDropService->end_location,
            'departure_date' => $this->pickAndDropService->departure_date,
            'departure_time' => $this->pickAndDropService->departure_time,
            'schedule_type' => $this->pickAndDropService->schedule_type,
            'price_per_seat' => $this->pickAndDropService->price_per_seat,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function rideRequestPayload(): ?array
    {
        if (! $this->relationLoaded('rideRequest') || ! $this->rideRequest) {
            return null;
        }

        return [
            'id' => $this->rideRequest->id,
            'start_location' => $this->rideRequest->start_location,
            'end_location' => $this->rideRequest->end_location,
            'departure_date' => $this->rideRequest->departure_date,
            'departure_time' => $this->rideRequest->departure_time,
            'schedule_type' => $this->rideRequest->schedule_type,
            'budget_per_seat' => $this->rideRequest->budget_per_seat,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function typeObjectPayload(): ?array
    {
        return match ($this->type) {
            'user' => $this->recipientUserPayload(),
            'pick_and_drop' => $this->pickAndDropServicePayload(),
            'ride_request' => $this->rideRequestPayload(),
            default => null,
        };
    }

    /**
     * Format conversation time to show relative time (e.g., "2 hours ago", "yesterday", "Monday at 3:00 PM")
     */
    private function formatConversationTime(Carbon $date): string
    {
        $now = Carbon::now();
        $diffSeconds = $now->diffInSeconds($date);
        $diffMinutes = $now->diffInMinutes($date);
        $diffHours = $now->diffInHours($date);
        $diffDays = $now->diffInDays($date);

        // Just now (less than 1 minute)
        if ($diffSeconds < 60) {
            return 'just now';
        }

        // Minutes ago (less than 1 hour)
        if ($diffMinutes < 60) {
            return $diffMinutes.' minute'.($diffMinutes > 1 ? 's' : '').' ago';
        }

        // Hours ago (less than 24 hours)
        if ($diffHours < 24) {
            return $diffHours.' hour'.($diffHours > 1 ? 's' : '').' ago';
        }

        // Yesterday
        $yesterday = Carbon::yesterday();
        if ($date->isSameDay($yesterday)) {
            $timeStr = $date->format('g:i A');

            return 'yesterday at '.$timeStr;
        }

        // This week (within last 7 days)
        if ($diffDays < 7) {
            $dayName = $date->format('l'); // Full day name (Monday, Tuesday, etc.)
            $timeStr = $date->format('g:i A');

            return $dayName.' at '.$timeStr;
        }

        // Older dates - show date and time
        $dateStr = $date->format('M j');
        // Include year if different from current year
        if ($date->year !== $now->year) {
            $dateStr .= ', '.$date->year;
        }
        $timeStr = $date->format('g:i A');

        return $dateStr.' at '.$timeStr;
    }
}
