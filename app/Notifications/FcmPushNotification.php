<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotificationResource;

class FcmPushNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected string $title,
        protected string $body,
        protected array $data = [],
        protected ?string $image = null,
        protected array $custom = [],
    ) {}

    public function via(object $notifiable): array
    {
        return [FcmChannel::class];
    }

    public function toFcm(object $notifiable): FcmMessage
    {
        $message = FcmMessage::create()->notification(
            new FcmNotificationResource(
                title: $this->title,
                body: $this->body,
                image: $this->image,
            )
        )->data($this->data);

        if ($this->custom !== []) {
            $message = $message->custom($this->custom);
        }

        return $message;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'body' => $this->body,
            'data' => $this->data,
            'image' => $this->image,
            'custom' => $this->custom,
        ];
    }
}
