<?php

namespace App\Http\Controllers\Customer;

use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use App\Http\Requests\Booking\CreateBookingRequest;
use App\Http\Requests\Booking\UpdateBookingRequest;
use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;

/**
 * @OA\Tag(
 *     name="Bookings",
 *     description="API Endpoints for booking management"
 * )
 */
class BookingController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/customer/bookings",
     *     operationId="getBookingsList",
     *     tags={"Bookings"},
     *     summary="Get list of bookings",
     *     description="Returns list of bookings with pagination",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Booking")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="per_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     )
     * )
     */
    public function index()
    {
        $bookings = Booking::with(['car', 'user'])->paginate(10);
        return BookingResource::collection($bookings);
    }

    /**
     * @OA\Post(
     *     path="/api/customer/bookings",
     *     operationId="storeBooking",
     *     tags={"Bookings"},
     *     summary="Store a new booking",
     *     description="Creates a new booking record",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/BookingRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Booking created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Booking")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function store(CreateBookingRequest $request)
    {
        $validated = $request->validated();
        $booking = Booking::create($validated);
        return new BookingResource($booking->load(['car', 'user']));
    }

    /**
     * @OA\Get(
     *     path="/api/customer/bookings/{id}",
     *     operationId="getBookingById",
     *     tags={"Bookings"},
     *     summary="Get booking information",
     *     description="Returns booking data by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Booking ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/Booking")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Booking not found"
     *     )
     * )
     */
    public function show(string $id)
    {
        $booking = Booking::with(['car', 'user'])->findOrFail($id);
        return new BookingResource($booking);
    }

    /**
     * @OA\Put(
     *     path="/api/customer/bookings/{id}",
     *     operationId="updateBooking",
     *     tags={"Bookings"},
     *     summary="Update booking information",
     *     description="Updates booking data by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Booking ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/BookingRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Booking updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Booking")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Booking not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function update(UpdateBookingRequest $request, string $id)
    {
        $booking = Booking::findOrFail($id);
        $validated = $request->validated();
        $booking->update($validated);
        return new BookingResource($booking->load(['car', 'user']));
    }

    /**
     * @OA\Delete(
     *     path="/api/customer/bookings/{id}",
     *     operationId="deleteBooking",
     *     tags={"Bookings"},
     *     summary="Delete booking",
     *     description="Deletes booking by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Booking ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Booking deleted successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="Booking deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Booking not found"
     *     )
     * )
     */
    public function destroy(string $id)
    {
        $booking = Booking::findOrFail($id);
        $booking->delete();
        
        return response()->json(['message' => 'Booking deleted successfully']);
    }
}
