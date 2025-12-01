<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class MessageResource extends JsonResource
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
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->sender_id,
            'message' => $this->message,
            'is_read' => $this->is_read,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'formatted_time' => $this->formatMessageTime($this->created_at),
            'sender' => $this->whenLoaded('sender', function () {
                return [
                    'id' => $this->sender->id,
                    'name' => $this->sender->name,
                ];
            }),
        ];
    }

    /**
     * Format message time to show relative time (e.g., "2 hours ago", "yesterday", "Monday at 3:00 PM")
     */
    private function formatMessageTime(Carbon $date): string
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
            return $diffMinutes . ' minute' . ($diffMinutes > 1 ? 's' : '') . ' ago';
        }

        // Hours ago (less than 24 hours)
        if ($diffHours < 24) {
            return $diffHours . ' hour' . ($diffHours > 1 ? 's' : '') . ' ago';
        }

        // Yesterday
        $yesterday = Carbon::yesterday();
        if ($date->isSameDay($yesterday)) {
            $timeStr = $date->format('g:i A');
            return 'yesterday at ' . $timeStr;
        }

        // This week (within last 7 days)
        if ($diffDays < 7) {
            $dayName = $date->format('l'); // Full day name (Monday, Tuesday, etc.)
            $timeStr = $date->format('g:i A');
            return $dayName . ' at ' . $timeStr;
        }

        // Older dates - show date and time
        $dateStr = $date->format('M j');
        // Include year if different from current year
        if ($date->year !== $now->year) {
            $dateStr .= ', ' . $date->year;
        }
        $timeStr = $date->format('g:i A');
        return $dateStr . ' at ' . $timeStr;
    }
}

