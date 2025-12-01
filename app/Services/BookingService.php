<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use App\Notifications\BookingCreatedNotification;
use App\Notifications\BookingStatusChangedNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class BookingService
{
    /**
     * Create a new booking
     */
    public function createBooking(array $bookingData): array
    {
        try {
            DB::beginTransaction();

            // Always use authenticated user
            $userId = auth()->id();

            // Set status to pending
            $status = 'pending';

            // Calculate total price based on rental_type
            $car = \App\Models\Car::findOrFail($bookingData['car_id']);

            // Create booking
            $booking = Booking::create([
                'user_id' => $userId,
                'car_id' => $bookingData['car_id'],
                'store_id' => $car->store_id,
                'car_offer_id' => $bookingData['car_offer_id'] ?? null,
                'pickup_location' => $bookingData['pickup_location'],
                'pickup_time' => $bookingData['pickup_time'],
                'pickup_date' => $bookingData['pickup_date'],
                'rental_type' => $bookingData['rental_type'],
                'refill_tank' => $bookingData['refill_tank'] ?? false,
                'number_of_days' => $bookingData['number_of_days'],
                'total_price' => $bookingData['total_price'],
                'guest_name' => $bookingData['guest_name'] ?? null,
                'guest_phone' => $bookingData['guest_phone'] ?? null,
                'status' => $status,
                'notes' => $bookingData['notes'] ?? null,
                'refill_amount_per_km' => 40,
            ]);

            // Load relationships for notification
            $booking->load(['car', 'user', 'store']);

            // Notify store owners about the new booking
            if ($booking->store) {
                $storeUsers = $booking->store->users;
                foreach ($storeUsers as $storeUser) {
                    $storeUser->notify(new BookingCreatedNotification($booking));
                }
            }

            DB::commit();

            return [
                'success' => true,
                'booking' => $this->formatBookingData($booking),
                'message' => 'Booking created successfully'
            ];

        } catch (Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Check if car is available for the given dates
     */
    public function isCarAvailable(int $carId, string $startDate, string $endDate): bool
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        // Check for conflicting bookings
        $conflictingBookings = Booking::where('car_id', $carId)
            ->whereIn('status', ['confirmed', 'active'])
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('start_date', [$start, $end])
                      ->orWhereBetween('end_date', [$start, $end])
                      ->orWhere(function ($q) use ($start, $end) {
                          $q->where('start_date', '<=', $start)
                            ->where('end_date', '>=', $end);
                      });
            })
            ->exists();

        return !$conflictingBookings;
    }

    /**
     * Calculate booking price
     */
    public function calculateBookingPrice(int $carId, string $startDate, string $endDate, string $durationType = 'hourly'): float
    {
        $car = Car::with(['carOffers' => function($query) {
            $query->where('is_active', true)
                  ->where('start_date', '<=', now())
                  ->where('end_date', '>=', now());
        }])->find($carId);

        if (!$car) {
            throw new Exception('Car not found');
        }

        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        // Calculate duration
        $duration = $this->calculateDuration($start, $end, $durationType);

        // Get base price
        $basePrice = $this->getBasePrice($durationType);

        // Apply any active offers
        $bestOffer = $car->carOffers->sortByDesc('discount_percentage')->first();
        if ($bestOffer) {
            $discount = $bestOffer->discount_percentage / 100;
            $basePrice = $basePrice * (1 - $discount);
        }

        return round($basePrice * $duration, 2);
    }

    /**
     * Calculate duration based on type
     */
    private function calculateDuration(Carbon $start, Carbon $end, string $durationType): float
    {
        switch ($durationType) {
            case 'hourly':
                return $start->diffInHours($end);
            case 'daily':
                return $start->diffInDays($end);
            case 'weekly':
                return $start->diffInWeeks($end);
            default:
                return $start->diffInHours($end);
        }
    }

    /**
     * Get base price for duration type
     */
    private function getBasePrice(string $durationType): float
    {
        $prices = [
            'hourly' => 25.00,
            'daily' => 150.00,
            'weekly' => 800.00,
        ];

        return $prices[$durationType] ?? $prices['hourly'];
    }

    /**
     * Get user bookings (paginated)
     */
    public function getUserBookings(int $userId, array $filters = [])
    {
        $query = Booking::with(['car.carBrand', 'car.carType', 'car.store', 'store'])
            ->where('user_id', $userId);

        // Apply filters
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('start_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('end_date', '<=', $filters['date_to']);
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(10);

        // Transform each booking for API response
        $bookings->getCollection()->transform(function ($booking) {
            return $this->formatBookingData($booking);
        });

        return $bookings;
    }

    /**
     * Get bookings for all stores the user is associated with (paginated)
     */
    public function getStoreUserBookings(int $userId, array $filters = [])
    {
        $user = \App\Models\User::find($userId);
        if (!$user) {
            return collect([]);
        }

        $query = Booking::with(['car.carBrand', 'car.carType', 'car.store', 'store']);

        // If user is admin, show all bookings from all stores
        if ($user->hasRole('admin')) {
            // Admin users can see all stores, but can filter by specific store
            if (!empty($filters['store_id'])) {
                $query->where('store_id', $filters['store_id']);
            }
        } else {
            // For non-admin users, only show bookings from their associated stores
            $storeIds = $user->stores()->pluck('stores.id');
            $query->whereIn('store_id', $storeIds);
        }

        // Apply filters
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['date_from'])) {
            $query->where('start_date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->where('end_date', '<=', $filters['date_to']);
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(10);
        $bookings->getCollection()->transform(function ($booking) {
            return $this->formatBookingData($booking);
        });
        return $bookings;
    }

    /**
     * Get booking by ID
     */
    public function getBooking($bookingId): ?array
    {
        $booking = Booking::with(['car.carBrand', 'car.carType', 'store', 'user'])
            ->find((int) $bookingId);

        if (!$booking) {
            return null;
        }

        return $this->formatBookingData($booking);
    }

    /**
     * Update booking status
     */
    public function updateBookingStatus($bookingId, string $status, string $notes = null): array
    {
        try {
            $booking = Booking::find((int) $bookingId);

            if (!$booking) {
                throw new Exception('Booking not found');
            }

            $oldStatus = $booking->status;

            $booking->update([
                'status' => $status,
                'notes' => $notes ?? $booking->notes,
            ]);

            // Load relationships for notification
            $booking->load(['car', 'user']);

            // Notify the customer about status change
            if ($booking->user && $oldStatus !== $status) {
                $booking->user->notify(new BookingStatusChangedNotification($booking, $oldStatus));
            }

            return [
                'success' => true,
                'booking' => $this->formatBookingData($booking),
                'message' => 'Booking status updated successfully'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Cancel booking
     */
    public function cancelBooking($bookingId, $userId): array
    {
        try {
            $booking = Booking::where('id', (int) $bookingId)
                ->where('user_id', (int) $userId)
                ->first();

            if (!$booking) {
                throw new Exception('Booking not found or unauthorized');
            }

            if (!in_array($booking->status, ['pending', 'confirmed'])) {
                throw new Exception('Booking cannot be cancelled in current status');
            }

            $booking->update([
                'status' => 'cancelled',
                'notes' => 'Cancelled by user'
            ]);

            return [
                'success' => true,
                'message' => 'Booking cancelled successfully'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Get booking statistics
     */
    public function getBookingStats(int $userId = null): array
    {
        $query = Booking::query();

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $totalBookings = $query->count();
        $pendingBookings = $query->where('status', 'pending')->count();
        $confirmedBookings = $query->where('status', 'confirmed')->count();
        $completedBookings = $query->where('status', 'completed')->count();
        $cancelledBookings = $query->where('status', 'cancelled')->count();

        return [
            'total' => $totalBookings,
            'pending' => $pendingBookings,
            'confirmed' => $confirmedBookings,
            'completed' => $completedBookings,
            'cancelled' => $cancelledBookings,
        ];
    }

    /**
     * Format booking data for API response
     */
    private function formatBookingData(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'user_id' => $booking->user_id,
            'guest_phone' => $booking->guest_phone,
            'guest_name' => $booking->guest_name,
            'car_id' => $booking->car_id,
            'store_id' => $booking->store_id,
            'rental_type' => $booking->rental_type,
            'pickup_date' => $booking->pickup_date,
            'pickup_time' => $booking->pickup_time,
            'pickup_location' => $booking->pickup_location,
            'total_price' => $booking->total_price,
            'status' => $booking->status,
            'notes' => $booking->notes,
            'created_at' => $booking->created_at,
            'updated_at' => $booking->updated_at,
            'car' => $booking->car ? (new \App\Http\Resources\CarResource($booking->car))->resolve() : null,
            'store' => $booking->store ? [
                'id' => $booking->store->id,
                'name' => $booking->store->name,
                'address' => $booking->store->address,
                'phone' => $booking->store->contact_phone,
            ] : null,
            'user' => $booking->user ? [
                'id' => $booking->user->id,
                'name' => $booking->user->name,
                'email' => $booking->user->email,
            ] : null,
        ];
    }
}
