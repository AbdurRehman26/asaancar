<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
        $diffSeconds = $date->diffInSeconds($now);
        $diffMinutes = $date->diffInMinutes($now);
        $diffHours = $date->diffInHours($now);

        if ($date->isSameDay($now)) {
            if ($diffSeconds < 60) {
                return 'just now';
            }

            if ($diffMinutes < 60) {
                return $diffMinutes.' minute'.($diffMinutes > 1 ? 's' : '').' ago';
            }

            return $diffHours.' hour'.($diffHours > 1 ? 's' : '').' ago';
        }

        $yesterday = Carbon::yesterday();
        if ($date->isSameDay($yesterday)) {
            $timeStr = $date->format('g:i A');

            return 'yesterday at '.$timeStr;
        }

        if ($date->greaterThanOrEqualTo($now->copy()->subDays(6)->startOfDay())) {
            $dayName = $date->format('l');
            $timeStr = $date->format('g:i A');

            return $dayName.' at '.$timeStr;
        }

        $dateStr = $date->format('M j');
        if ($date->year !== $now->year) {
            $dateStr .= ', '.$date->year;
        }
        $timeStr = $date->format('g:i A');

        return $dateStr.' at '.$timeStr;
    }
}
