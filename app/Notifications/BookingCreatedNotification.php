<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;

class BookingCreatedNotification extends Notification
{
    use Queueable;

    protected $booking;

    /**
     * Create a new notification instance.
     */
    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
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
        $customerName = $this->booking->user ? $this->booking->user->name : 'Guest';
        
        return (new MailMessage)
            ->subject('New Booking Received - AsaanCar')
            ->line("You have received a new booking for {$carName}.")
            ->line("Customer: {$customerName}")
            ->line("Pickup Date: {$this->booking->pickup_date}")
            ->line("Total Price: Rs. {$this->booking->total_price}")
            ->action('View Booking', url('/dashboard/bookings/' . $this->booking->id))
            ->line('Thank you for using AsaanCar!');
    }

    /**
     * Get the web push representation of the notification.
     */
    public function toWebPush($notifiable, $notification)
    {
        $carName = $this->booking->car ? $this->booking->car->name : 'Car';
        $customerName = $this->booking->user ? $this->booking->user->name : 'Guest';
        
        return (new WebPushMessage)
            ->title('New Booking Received')
            ->icon('/icon.png')
            ->body("New booking for {$carName} from {$customerName}")
            ->badge('/icon.png')
            ->data(['booking_id' => $this->booking->id, 'type' => 'booking_created']);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $carName = $this->booking->car ? $this->booking->car->name : 'Car';
        $customerName = $this->booking->user ? $this->booking->user->name : 'Guest';
        
        return [
            'type' => 'booking_created',
            'booking_id' => $this->booking->id,
            'car_id' => $this->booking->car_id,
            'car_name' => $carName,
            'customer_name' => $customerName,
            'total_price' => $this->booking->total_price,
            'pickup_date' => $this->booking->pickup_date,
            'status' => $this->booking->status,
            'message' => "New booking for {$carName} from {$customerName}",
        ];
    }
}
