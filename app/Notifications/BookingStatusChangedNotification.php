<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;

class BookingStatusChangedNotification extends Notification
{
    use Queueable;

    protected $booking;
    protected $oldStatus;

    /**
     * Create a new notification instance.
     */
    public function __construct(Booking $booking, $oldStatus = null)
    {
        $this->booking = $booking;
        $this->oldStatus = $oldStatus;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];
        
        // Add mail if user has email
        if ($notifiable->email) {
            $channels[] = 'mail';
        }
        
        // Add web push if user has subscriptions
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
        $carName = $this->booking->car ? $this->booking->car->name : 'Car';
        $status = ucfirst($this->booking->status);
        
        return (new MailMessage)
            ->subject("Booking Status Updated - AsaanCar")
            ->line("Your booking for {$carName} has been updated.")
            ->line("New Status: {$status}")
            ->line("Pickup Date: {$this->booking->pickup_date}")
            ->action('View Booking', url('/bookings/' . $this->booking->id))
            ->line('Thank you for using AsaanCar!');
    }

    /**
     * Get the web push representation of the notification.
     */
    public function toWebPush($notifiable, $notification)
    {
        $carName = $this->booking->car ? $this->booking->car->name : 'Car';
        $status = ucfirst($this->booking->status);
        
        return (new WebPushMessage)
            ->title('Booking Status Updated')
            ->icon('/icon.png')
            ->body("Your booking for {$carName} is now {$status}")
            ->badge('/icon.png')
            ->data(['booking_id' => $this->booking->id, 'type' => 'booking_status_changed', 'status' => $this->booking->status]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $carName = $this->booking->car ? $this->booking->car->name : 'Car';
        $status = ucfirst($this->booking->status);
        
        return [
            'type' => 'booking_status_changed',
            'booking_id' => $this->booking->id,
            'car_id' => $this->booking->car_id,
            'car_name' => $carName,
            'old_status' => $this->oldStatus,
            'new_status' => $this->booking->status,
            'message' => "Your booking for {$carName} is now {$status}",
        ];
    }
}
