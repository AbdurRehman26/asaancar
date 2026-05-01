<?php

namespace App\Models;

use App\Notifications\CustomEmailVerificationNotification;
use App\Notifications\CustomPasswordResetNotification;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use NotificationChannels\WebPush\HasPushSubscriptions;
use Spatie\Permission\Traits\HasRoles;

/**
 * @OA\Schema(
 *     schema="User",
 *     title="User",
 *     description="User model",
 *
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *     @OA\Property(property="email_verified_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time"),
 *     @OA\Property(property="profile_image", type="string", nullable=true, example="https://example.com/image.jpg")
 * )
 */
class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    use HasPushSubscriptions;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'password',
        'otp_code',
        'otp_expires_at',
        'is_verified',
        'profile_image',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'otp_expires_at' => 'datetime',
            'is_verified' => 'boolean',
            'password' => 'hashed',
        ];
    }

    protected $appends = [
        'password_set',
    ];

    public function getPasswordSetAttribute(): bool
    {
        return ! empty($this->password);
    }

    public function getOtpStatusAttribute(): string
    {
        if (! $this->otp_code || ! $this->otp_expires_at) {
            return 'No OTP';
        }

        return $this->otp_expires_at->isPast() ? 'Expired' : 'Active';
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $panel->getId() === 'admin' && $this->hasRole('admin');
    }

    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'messages', 'sender_id', 'conversation_id')->distinct();
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function favoritePickAndDrops()
    {
        return $this->belongsToMany(PickAndDrop::class, 'pick_and_drop_favorites', 'user_id', 'pick_and_drop_service_id')->withTimestamps();
    }

    public function rideRequests()
    {
        return $this->hasMany(RideRequest::class);
    }

    public function liveRideRequestsAsRider(): HasMany
    {
        return $this->hasMany(LiveRideRequest::class, 'rider_user_id');
    }

    public function liveRideRequestsAsDriver(): HasMany
    {
        return $this->hasMany(LiveRideRequest::class, 'driver_user_id');
    }

    public function driverAvailability(): HasOne
    {
        return $this->hasOne(DriverAvailability::class, 'driver_user_id');
    }

    public function driverLocation(): HasOne
    {
        return $this->hasOne(DriverLocation::class, 'driver_user_id');
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomEmailVerificationNotification);
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomPasswordResetNotification($token));
    }
}
