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
            'recipient_user_id' => $this->recipient_user_id,
            'pick_and_drop_service_id' => $this->pick_and_drop_service_id,
            'last_message' => $this->lastMessage ? $this->lastMessage->message : null,
            'unread_count' => $this->unread_count ?? 0,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
            'formatted_time' => $this->updated_at ? $this->formatConversationTime($this->updated_at) : null,
            'recipientUser' => $this->whenLoaded('recipientUser'),
            'pickAndDropService' => $this->whenLoaded('pickAndDropService'),
        ];
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
