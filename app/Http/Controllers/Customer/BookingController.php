<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use App\Http\Requests\Booking\CreateBookingRequest;
use App\Http\Requests\Booking\UpdateBookingRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['status', 'date_from', 'date_to']);
        $bookings = $this->bookingService->getUserBookings(auth()->id(), $filters);
        return response()->json(['data' => $bookings]);
    }

    /**
     * Show the form for creating a new resource.
     */
    // Removed: create() method (Inertia only)

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateBookingRequest $request)
    {
        $bookingData = $request->validated();
        $bookingData['user_id'] = auth()->id();

        $result = $this->bookingService->createBooking($bookingData);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message']
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => $result['booking'],
            'message' => $result['message']
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $booking = $this->bookingService->getBooking($id);
        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }
        if ($booking['user_id'] !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json(['data' => $booking]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    // Removed: edit() method (Inertia only)

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBookingRequest $request, int $id)
    {
        $booking = $this->bookingService->getBooking($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }

        // Check if user owns this booking
        if ($booking['user_id'] !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $result = $this->bookingService->updateBookingStatus(
            $id, 
            $request->validated()['status'],
            $request->validated()['notes'] ?? null
        );

        return response()->json($result);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        $result = $this->bookingService->cancelBooking($id, auth()->id());

        return response()->json($result);
    }

    /**
     * Get booking statistics
     */
    public function stats()
    {
        $stats = $this->bookingService->getBookingStats(auth()->id());

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Check car availability
     */
    public function checkAvailability(Request $request)
    {
        $request->validate([
            'car_id' => 'required|integer|exists:cars,id',
            'start_date' => 'required|date|after:now',
            'end_date' => 'required|date|after:start_date',
        ]);

        $isAvailable = $this->bookingService->isCarAvailable(
            $request->car_id,
            $request->start_date,
            $request->end_date
        );

        return response()->json([
            'success' => true,
            'data' => [
                'available' => $isAvailable
            ]
        ]);
    }

    /**
     * Calculate booking price
     */
    public function calculatePrice(Request $request)
    {
        $request->validate([
            'car_id' => 'required|integer|exists:cars,id',
            'start_date' => 'required|date|after:now',
            'end_date' => 'required|date|after:start_date',
            'duration_type' => 'required|in:hourly,daily,weekly',
        ]);

        try {
            $price = $this->bookingService->calculateBookingPrice(
                $request->car_id,
                $request->start_date,
                $request->end_date,
                $request->duration_type
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'total_price' => $price
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
