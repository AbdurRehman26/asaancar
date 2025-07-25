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
        $perPage = $request->input('per_page', 10);
        $bookings = $this->bookingService->getUserBookings(auth()->id(), $filters);
        // Return paginated response with meta and links
        return response()->json([
            'data' => $bookings->items(),
            'current_page' => $bookings->currentPage(),
            'per_page' => $bookings->perPage(),
            'total' => $bookings->total(),
            'last_page' => $bookings->lastPage(),
            'from' => $bookings->firstItem(),
            'to' => $bookings->lastItem(),
        ]);
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
    public function stats(Request $request)
    {
        $user = $request->user();
        // Get all store IDs for this user
        $storeIds = $user->stores()->pluck('id');
        $count = \App\Models\Booking::whereIn('store_id', $storeIds)->count();
        return response()->json(['count' => $count]);
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

    /**
     * Get the current user's booking for a specific car (if any)
     */
    public function userBookingForCar(Request $request, $carId)
    {
        $bookings = \App\Models\Booking::where('user_id', auth()->id())
            ->where('car_id', $carId)
            ->orderByDesc('created_at')
            ->get();

        return BookingResource::collection($bookings);
    }

    /**
     * Store a guest booking (unauthenticated).
     */
    public function guestBooking(Request $request)
    {
        $validated = $request->validate([
            'car_id' => 'required|integer|exists:cars,id',
            'guest_name' => 'required|string|max:255',
            'guest_phone' => 'required|string|max:255',
            'pickup_location' => 'nullable|string|max:255',
            'pickup_time' => 'nullable|string|max:255',
            'pickup_date' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'rental_type' => 'nullable|string',
            'number_of_days' => 'nullable|integer',
            'total_price' => 'nullable|numeric',
            'car_offer_id' => 'nullable|integer',
            'refill_tank' => 'nullable|boolean',
        ]);

        $bookingData = $validated;
        $bookingData['user_id'] = null;

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
     * Display bookings for all stores the user is associated with.
     */
    public function storeBookingsForUser(Request $request)
    {
        $filters = $request->only(['status', 'date_from', 'date_to']);
        $perPage = $request->input('per_page', 10);
        $bookings = $this->bookingService->getStoreUserBookings(auth()->id(), $filters);
        // Return paginated response with meta and links
        return response()->json([
            'data' => $bookings->items(),
            'current_page' => $bookings->currentPage(),
            'per_page' => $bookings->perPage(),
            'total' => $bookings->total(),
            'last_page' => $bookings->lastPage(),
            'from' => $bookings->firstItem(),
            'to' => $bookings->lastItem(),
        ]);
    }
}
