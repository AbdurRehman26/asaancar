<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use App\Http\Requests\Booking\CreateBookingRequest;
use App\Http\Requests\Booking\UpdateBookingRequest;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Bookings",
 *     description="API Endpoints for booking management"
 * )
 */
class BookingController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * @OA\Get(
     *     path="/api/bookings",
     *     operationId="getBookings",
     *     tags={"Bookings"},
     *     summary="List bookings",
     *     description="Get a paginated list of bookings for the authenticated user",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="status", in="query", description="Filter by status", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="date_from", in="query", description="Filter from date", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="date_to", in="query", description="Filter to date", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="per_page", in="query", description="Items per page", required=false, @OA\Schema(type="integer", default=10)),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Booking")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="per_page", type="integer"),
     *             @OA\Property(property="total", type="integer"),
     *             @OA\Property(property="last_page", type="integer")
     *         )
     *     )
     * )
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
     * @OA\Post(
     *     path="/api/bookings",
     *     operationId="createBooking",
     *     tags={"Bookings"},
     *     summary="Create booking",
     *     description="Create a new booking",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/BookingRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Booking created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", ref="#/components/schemas/Booking"),
     *             @OA\Property(property="message", type="string", example="Booking created successfully")
     *         )
     *     ),
     *     @OA\Response(response=400, description="Booking creation failed"),
     *     @OA\Response(response=422, description="Validation error")
     * )
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
     * @OA\Get(
     *     path="/api/bookings/{id}",
     *     operationId="getBooking",
     *     tags={"Bookings"},
     *     summary="Get booking details",
     *     description="Get detailed information about a specific booking",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="Booking ID", @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Booking")
     *         )
     *     ),
     *     @OA\Response(response=403, description="Unauthorized - not the owner"),
     *     @OA\Response(response=404, description="Booking not found")
     * )
     * Display the specified resource.
     */
    public function show($id)
    {
        $booking = $this->bookingService->getBooking((int) $id);
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
     * @OA\Put(
     *     path="/api/bookings/{id}",
     *     operationId="updateBooking",
     *     tags={"Bookings"},
     *     summary="Update booking",
     *     description="Update booking status and notes (only owner can update)",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="Booking ID", @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", example="confirmed"),
     *             @OA\Property(property="notes", type="string", example="Additional notes", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Booking updated successfully",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(response=403, description="Unauthorized - not the owner"),
     *     @OA\Response(response=404, description="Booking not found")
     * )
     * Update the specified resource in storage.
     */
    public function update(UpdateBookingRequest $request, $id)
    {
        $booking = $this->bookingService->getBooking((int) $id);

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
     * @OA\Delete(
     *     path="/api/bookings/{id}",
     *     operationId="cancelBooking",
     *     tags={"Bookings"},
     *     summary="Cancel booking",
     *     description="Cancel a booking (only owner can cancel)",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="Booking ID", @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Booking cancelled successfully",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(response=403, description="Unauthorized - not the owner"),
     *     @OA\Response(response=404, description="Booking not found")
     * )
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $result = $this->bookingService->cancelBooking((int) $id, auth()->id());

        return response()->json($result);
    }

    /**
     * @OA\Get(
     *     path="/api/bookings/stats",
     *     operationId="getBookingStats",
     *     tags={"Bookings"},
     *     summary="Get booking statistics",
     *     description="Get booking statistics for user's stores",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="store_id", in="query", description="Filter by store ID", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="count", type="integer", example=50)
     *         )
     *     )
     * )
     * Get booking statistics
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        $storeId = $request->get('store_id');
        
        // Get all store IDs for this user
        $storeIds = $user->stores()->pluck('stores.id');
        
        $query = \App\Models\Booking::whereIn('store_id', $storeIds);
        
        // Filter by specific store if provided
        if ($storeId) {
            $query->where('store_id', $storeId);
        }

        $count = $query->count();

        return response()->json(['count' => $count]);
    }

    /**
     * @OA\Post(
     *     path="/api/bookings/check-availability",
     *     operationId="checkCarAvailability",
     *     tags={"Bookings"},
     *     summary="Check car availability",
     *     description="Check if a car is available for the specified date range",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"car_id", "start_date", "end_date"},
     *             @OA\Property(property="car_id", type="integer", example=1),
     *             @OA\Property(property="start_date", type="string", format="date-time", example="2024-01-15 10:00:00"),
     *             @OA\Property(property="end_date", type="string", format="date-time", example="2024-01-20 10:00:00")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="available", type="boolean", example=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
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
     * @OA\Post(
     *     path="/api/bookings/calculate-price",
     *     operationId="calculateBookingPrice",
     *     tags={"Bookings"},
     *     summary="Calculate booking price",
     *     description="Calculate the total price for a booking based on car, dates, and duration type",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"car_id", "start_date", "end_date", "duration_type"},
     *             @OA\Property(property="car_id", type="integer", example=1),
     *             @OA\Property(property="start_date", type="string", format="date-time", example="2024-01-15 10:00:00"),
     *             @OA\Property(property="end_date", type="string", format="date-time", example="2024-01-20 10:00:00"),
     *             @OA\Property(property="duration_type", type="string", enum={"hourly", "daily", "weekly"}, example="daily")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Price calculated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="total_price", type="number", format="float", example=5000.00)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=400, description="Calculation failed"),
     *     @OA\Response(response=422, description="Validation error")
     * )
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
     * @OA\Post(
     *     path="/api/guest-booking",
     *     operationId="createGuestBooking",
     *     tags={"Bookings"},
     *     summary="Create guest booking",
     *     description="Create a booking for an unauthenticated guest user",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"car_id", "guest_name", "guest_phone"},
     *             @OA\Property(property="car_id", type="integer", example=1),
     *             @OA\Property(property="guest_name", type="string", example="John Doe"),
     *             @OA\Property(property="guest_phone", type="string", example="+923001234567"),
     *             @OA\Property(property="pickup_location", type="string", example="Karachi Airport", nullable=true),
     *             @OA\Property(property="pickup_time", type="string", example="10:00 AM", nullable=true),
     *             @OA\Property(property="pickup_date", type="string", example="2024-01-15", nullable=true),
     *             @OA\Property(property="notes", type="string", nullable=true),
     *             @OA\Property(property="rental_type", type="string", nullable=true),
     *             @OA\Property(property="number_of_days", type="integer", nullable=true),
     *             @OA\Property(property="total_price", type="number", format="float", nullable=true),
     *             @OA\Property(property="car_offer_id", type="integer", nullable=true),
     *             @OA\Property(property="refill_tank", type="boolean", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Guest booking created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", ref="#/components/schemas/Booking"),
     *             @OA\Property(property="message", type="string", example="Booking created successfully")
     *         )
     *     ),
     *     @OA\Response(response=400, description="Booking creation failed"),
     *     @OA\Response(response=422, description="Validation error")
     * )
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
        $filters = $request->only(['status', 'date_from', 'date_to', 'store_id']);
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
