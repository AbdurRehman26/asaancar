<?php

namespace App\Models;

use Database\Factories\ContactingStatFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class ContactingStat extends Model
{
    /** @use HasFactory<ContactingStatFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'recipient_user_id',
        'contactable_type',
        'contactable_id',
        'contact_method',
        'interaction_count',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'recipient_user_id' => 'integer',
        'contactable_id' => 'integer',
        'interaction_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recipientUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    public function pickAndDrop(): BelongsTo
    {
        return $this->belongsTo(PickAndDrop::class, 'contactable_id');
    }

    public function rideRequest(): BelongsTo
    {
        return $this->belongsTo(RideRequest::class, 'contactable_id');
    }

    protected function contactedListingLabel(): Attribute
    {
        return Attribute::make(
            get: fn (): string => $this->contactable_type === 'pick_and_drop' ? 'Ride' : 'Ride Request',
        );
    }

    protected function contactedRoute(): Attribute
    {
        return Attribute::make(
            get: function (): ?string {
                $contactedRecord = $this->contactedRecord();

                if (! $contactedRecord) {
                    return null;
                }

                return "{$contactedRecord->start_location} -> {$contactedRecord->end_location}";
            },
        );
    }

    protected function contactedDeparture(): Attribute
    {
        return Attribute::make(
            get: function (): ?string {
                $contactedRecord = $this->contactedRecord();

                if (! $contactedRecord || ! $contactedRecord->departure_time) {
                    return null;
                }

                $departureTime = $contactedRecord->departure_time instanceof Carbon
                    ? $contactedRecord->departure_time
                    : Carbon::parse($contactedRecord->departure_time);

                return $departureTime->format('d M, g:i A');
            },
        );
    }

    protected function contactedPriceSummary(): Attribute
    {
        return Attribute::make(
            get: function (): ?string {
                $contactedRecord = $this->contactedRecord();

                if (! $contactedRecord) {
                    return null;
                }

                if ($this->contactable_type === 'pick_and_drop' && $contactedRecord->price_per_person) {
                    $currency = $contactedRecord->currency ?: 'PKR';

                    return "{$currency} ".number_format((float) $contactedRecord->price_per_person).' / person';
                }

                if ($this->contactable_type === 'ride_request' && $contactedRecord->budget_per_seat) {
                    $currency = $contactedRecord->currency ?: 'PKR';

                    return "{$currency} ".number_format((float) $contactedRecord->budget_per_seat).' / seat';
                }

                return null;
            },
        );
    }

    protected function contactedSchedule(): Attribute
    {
        return Attribute::make(
            get: function (): ?string {
                $contactedRecord = $this->contactedRecord();

                if (! $contactedRecord || ! $contactedRecord->schedule_type) {
                    return null;
                }

                return str($contactedRecord->schedule_type)->headline()->toString();
            },
        );
    }

    protected function contactedRecord(): PickAndDrop|RideRequest|null
    {
        return match ($this->contactable_type) {
            'pick_and_drop' => $this->pickAndDrop,
            'ride_request' => $this->rideRequest,
            default => null,
        };
    }
}
