<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
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

            // Validate car availability
            if (!$this->isCarAvailable($bookingData['car_id'], $bookingData['start_date'], $bookingData['end_date'])) {
                throw new Exception('Car is not available for the selected dates');
            }

            // Calculate total price
            $totalPrice = $this->calculateBookingPrice(
                $bookingData['car_id'],
                $bookingData['start_date'],
                $bookingData['end_date'],
                $bookingData['duration_type'] ?? 'hourly'
            );

            // Create booking
            $booking = Booking::create([
                'user_id' => $bookingData['user_id'],
                'car_id' => $bookingData['car_id'],
                'store_id' => $bookingData['store_id'],
                'start_date' => $bookingData['start_date'],
                'end_date' => $bookingData['end_date'],
                'duration_type' => $bookingData['duration_type'] ?? 'hourly',
                'total_price' => $totalPrice,
                'status' => 'pending',
                'notes' => $bookingData['notes'] ?? null,
            ]);

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
     * Get booking by ID
     */
    public function getBooking(int $bookingId): ?array
    {
        $booking = Booking::with(['car.carBrand', 'car.carType', 'store', 'user'])
            ->find($bookingId);

        if (!$booking) {
            return null;
        }

        return $this->formatBookingData($booking);
    }

    /**
     * Update booking status
     */
    public function updateBookingStatus(int $bookingId, string $status, string $notes = null): array
    {
        try {
            $booking = Booking::find($bookingId);
            
            if (!$booking) {
                throw new Exception('Booking not found');
            }

            $booking->update([
                'status' => $status,
                'notes' => $notes ?? $booking->notes,
            ]);

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
    public function cancelBooking(int $bookingId, int $userId): array
    {
        try {
            $booking = Booking::where('id', $bookingId)
                ->where('user_id', $userId)
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
            'car_id' => $booking->car_id,
            'store_id' => $booking->store_id,
            'start_date' => $booking->start_date,
            'end_date' => $booking->end_date,
            'duration_type' => $booking->duration_type,
            'total_price' => $booking->total_price,
            'status' => $booking->status,
            'notes' => $booking->notes,
            'created_at' => $booking->created_at,
            'updated_at' => $booking->updated_at,
            'car' => $booking->car ? [
                'id' => $booking->car->id,
                'name' => $booking->car->name ?? ($booking->car->carBrand ? $booking->car->carBrand->name . ' ' . $booking->car->model : $booking->car->model),
                'brand' => $booking->car->carBrand ? $booking->car->carBrand->name : 'Unknown',
                'model' => $booking->car->model,
                'year' => $booking->car->year,
                'image' => $booking->car->image_urls && count($booking->car->image_urls) > 0 ? $booking->car->image_urls[0] : null,
                'store' => $booking->car->store ? [
                    'id' => $booking->car->store->id,
                    'name' => $booking->car->store->name,
                    'address' => $booking->car->store->address,
                    'phone' => $booking->car->store->contact_phone,
                ] : null,
            ] : null,
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