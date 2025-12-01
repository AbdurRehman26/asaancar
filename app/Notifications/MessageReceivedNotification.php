<?php

namespace App\Notifications;

use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;

class MessageReceivedNotification extends Notification
{
    use Queueable;

    protected $message;
    protected $conversation;

    /**
     * Create a new notification instance.
     */
    public function __construct(Message $message, Conversation $conversation = null)
    {
        $this->message = $message;
        $this->conversation = $conversation;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];
        
        // Add web push if user has subscriptions (usually don't send email for messages)
        if ($notifiable->pushSubscriptions()->exists()) {
            $channels[] = 'webpush';
        }
        
        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $senderName = $this->message->sender ? $this->message->sender->name : 'Someone';
        $preview = strlen($this->message->message) > 100 
            ? substr($this->message->message, 0, 100) . '...' 
            : $this->message->message;
        
        return (new MailMessage)
            ->subject("New Message from {$senderName} - AsaanCar")
            ->line("You have received a new message from {$senderName}.")
            ->line($preview)
            ->action('View Conversation', url('/chat/' . $this->message->conversation_id))
            ->line('Thank you for using AsaanCar!');
    }

    /**
     * Get the web push representation of the notification.
     */
    public function toWebPush($notifiable, $notification)
    {
        $senderName = $this->message->sender ? $this->message->sender->name : 'Someone';
        $preview = strlen($this->message->message) > 100 
            ? substr($this->message->message, 0, 100) . '...' 
            : $this->message->message;
        
        return (new WebPushMessage)
            ->title("New Message from {$senderName}")
            ->icon('/icon.png')
            ->body($preview)
            ->badge('/icon.png')
            ->data([
                'conversation_id' => $this->message->conversation_id,
                'message_id' => $this->message->id,
                'type' => 'message_received'
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $senderName = $this->message->sender ? $this->message->sender->name : 'Someone';
        $preview = strlen($this->message->message) > 100 
            ? substr($this->message->message, 0, 100) . '...' 
            : $this->message->message;
        
        return [
            'type' => 'message_received',
            'conversation_id' => $this->message->conversation_id,
            'message_id' => $this->message->id,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $senderName,
            'message_preview' => $preview,
            'message' => "New message from {$senderName}",
        ];
    }
}
