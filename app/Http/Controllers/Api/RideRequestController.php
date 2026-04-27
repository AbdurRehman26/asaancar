<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRideRequest;
use App\Http\Requests\UpdateRideRequest;
use App\Http\Resources\RideRequestResource;
use App\Models\RideRequest;
use App\Support\DepartureDateNormalizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Ride Requests",
 *     description="API Endpoints for ride requests"
 * )
 */
class RideRequestController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/ride-requests",
     *     operationId="getRideRequests",
     *     tags={"Ride Requests"},
     *     summary="List ride requests",
     *     description="Get a paginated list of active ride requests with optional filters",
     *
     *     @OA\Parameter(name="start_location", in="query", description="Filter by start location", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="start_latitude", in="query", description="Start latitude for nearest match search", required=false, @OA\Schema(type="number", format="float")),
     *     @OA\Parameter(name="start_longitude", in="query", description="Start longitude for nearest match search", required=false, @OA\Schema(type="number", format="float")),
     *     @OA\Parameter(name="end_location", in="query", description="Filter by end location", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="end_latitude", in="query", description="End latitude for nearest match search", required=false, @OA\Schema(type="number", format="float")),
     *     @OA\Parameter(name="end_longitude", in="query", description="End longitude for nearest match search", required=false, @OA\Schema(type="number", format="float")),
     *     @OA\Parameter(name="preferred_driver_gender", in="query", description="Filter by preferred driver gender", required=false, @OA\Schema(type="string", enum={"male", "female", "any"})),
     *     @OA\Parameter(name="required_seats", in="query", description="Minimum seats needed", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="departure_date", in="query", description="Filter by departure date (YYYY-MM-DD)", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="departure_time", in="query", description="Filter by departure time (HH:MM)", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", description="Items per page", required=false, @OA\Schema(type="integer", default=15)),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/RideRequest")),
     *             @OA\Property(property="meta", type="object",
     *                 @OA\Property(property="current_page", type="integer"),
     *                 @OA\Property(property="last_page", type="integer"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="total", type="integer")
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        if ($request->exists('departure_date')) {
            $request->merge([
                'departure_date' => DepartureDateNormalizer::normalize($request->input('departure_date')),
            ]);
        }

        $query = RideRequest::query()
            ->with('user')
            ->where('is_active', true);

        $this->applyFilters($query, $request);

        $query->orderBy('created_at', 'desc')->orderBy('departure_time', 'asc');

        $requests = $query->paginate((int) $request->input('per_page', 15));

        return RideRequestResource::collection($requests)->additional([
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
                'from' => $requests->firstItem(),
                'to' => $requests->lastItem(),
            ],
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/customer/ride-requests",
     *     operationId="createRideRequest",
     *     tags={"Ride Requests"},
     *     summary="Create ride request",
     *     description="Create a new ride request",
     *     security={{"sanctum": {}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"start_location", "end_location", "departure_time", "required_seats", "preferred_driver_gender"},
     *
     *             @OA\Property(property="name", type="string", nullable=true, example="Sarah Ahmed"),
     *             @OA\Property(property="contact", type="string", nullable=true, example="+923001112233"),
     *             @OA\Property(property="start_location", type="string", example="Lahore, Pakistan"),
     *             @OA\Property(property="start_place_id", type="string", nullable=true, example="ChIJ2QeB5YMEGTkRYiR-zGy-OsI"),
     *             @OA\Property(property="start_latitude", type="number", format="float", nullable=true, example=31.5204),
     *             @OA\Property(property="start_longitude", type="number", format="float", nullable=true, example=74.3587),
     *             @OA\Property(property="end_location", type="string", example="Karachi, Pakistan"),
     *             @OA\Property(property="end_place_id", type="string", nullable=true, example="ChIJv8nA2Y4-sz4R77g5SRY5uW0"),
     *             @OA\Property(property="end_latitude", type="number", format="float", nullable=true, example=24.8607),
     *             @OA\Property(property="end_longitude", type="number", format="float", nullable=true, example=67.0011),
     *             @OA\Property(property="departure_date", type="string", format="date", nullable=true, example="2026-04-25"),
     *             @OA\Property(property="departure_time", type="string", format="time", example="08:30"),
     *             @OA\Property(property="schedule_type", type="string", enum={"once", "everyday", "weekdays", "weekends", "custom"}, example="once"),
     *             @OA\Property(property="selected_days", type="array", @OA\Items(type="string"), nullable=true, example={"Monday", "Wednesday"}),
     *             @OA\Property(property="is_roundtrip", type="boolean", example=false),
     *             @OA\Property(property="return_time", type="string", format="time", nullable=true, example="18:00"),
     *             @OA\Property(property="required_seats", type="integer", example=2),
     *             @OA\Property(property="preferred_driver_gender", type="string", enum={"male", "female", "any"}, example="female"),
     *             @OA\Property(property="budget_per_seat", type="integer", nullable=true, example=1200),
     *             @OA\Property(property="currency", type="string", example="PKR"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Need a comfortable morning ride."),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Ride request created successfully",
     *
     *         @OA\JsonContent(ref="#/components/schemas/RideRequest")
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreRideRequest $request): RideRequestResource
    {
        $rideRequest = RideRequest::create($this->buildPayload($request->validated(), Auth::id()));

        return new RideRequestResource($rideRequest->fresh()->load('user'));
    }

    /**
     * @OA\Get(
     *     path="/api/ride-requests/{id}",
     *     operationId="getRideRequest",
     *     tags={"Ride Requests"},
     *     summary="Get ride request details",
     *     description="Get detailed information about a specific ride request",
     *
     *     @OA\Parameter(name="id", in="path", required=true, description="Ride request ID", @OA\Schema(type="integer")),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(ref="#/components/schemas/RideRequest")
     *     ),
     *
     *     @OA\Response(response=404, description="Ride request not found")
     * )
     */
    public function show(string $id): RideRequestResource
    {
        $rideRequest = RideRequest::with('user')->findOrFail($id);

        return new RideRequestResource($rideRequest);
    }

    /**
     * @OA\Put(
     *     path="/api/customer/ride-requests/{id}",
     *     operationId="updateRideRequest",
     *     tags={"Ride Requests"},
     *     summary="Update ride request",
     *     description="Update an existing ride request (only owner can update)",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Parameter(name="id", in="path", required=true, description="Ride request ID", @OA\Schema(type="integer")),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="name", type="string", nullable=true, example="Sarah Ahmed"),
     *             @OA\Property(property="contact", type="string", nullable=true, example="+923001112233"),
     *             @OA\Property(property="start_location", type="string", example="Lahore, Pakistan"),
     *             @OA\Property(property="end_location", type="string", example="Karachi, Pakistan"),
     *             @OA\Property(property="departure_date", type="string", format="date", nullable=true, example="2026-04-25"),
     *             @OA\Property(property="departure_time", type="string", format="time", example="08:30"),
     *             @OA\Property(property="schedule_type", type="string", enum={"once", "everyday", "weekdays", "weekends", "custom"}, example="custom"),
     *             @OA\Property(property="selected_days", type="array", @OA\Items(type="string"), nullable=true, example={"Monday", "Wednesday"}),
     *             @OA\Property(property="is_roundtrip", type="boolean", example=true),
     *             @OA\Property(property="return_time", type="string", format="time", nullable=true, example="18:00"),
     *             @OA\Property(property="required_seats", type="integer", example=2),
     *             @OA\Property(property="preferred_driver_gender", type="string", enum={"male", "female", "any"}, example="female"),
     *             @OA\Property(property="budget_per_seat", type="integer", nullable=true, example=1200),
     *             @OA\Property(property="currency", type="string", example="PKR"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Need a comfortable morning ride."),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Ride request updated successfully",
     *
     *         @OA\JsonContent(ref="#/components/schemas/RideRequest")
     *     ),
     *
     *     @OA\Response(response=403, description="Unauthorized - not the owner"),
     *     @OA\Response(response=404, description="Ride request not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(UpdateRideRequest $request, string $id): RideRequestResource
    {
        $rideRequest = RideRequest::findOrFail($id);

        if ($rideRequest->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        $rideRequest->update($this->buildPayload($request->validated(), $rideRequest->user_id, $rideRequest));

        return new RideRequestResource($rideRequest->fresh()->load('user'));
    }

    /**
     * @OA\Delete(
     *     path="/api/customer/ride-requests/{id}",
     *     operationId="deleteRideRequest",
     *     tags={"Ride Requests"},
     *     summary="Delete ride request",
     *     description="Delete a ride request (only owner can delete)",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Parameter(name="id", in="path", required=true, description="Ride request ID", @OA\Schema(type="integer")),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Ride request deleted successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Ride request deleted successfully")
     *         )
     *     ),
     *
     *     @OA\Response(response=403, description="Unauthorized - not the owner"),
     *     @OA\Response(response=404, description="Ride request not found")
     * )
     */
    public function destroy(string $id)
    {
        $rideRequest = RideRequest::findOrFail($id);

        if ($rideRequest->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        $rideRequest->delete();

        return response()->json(['message' => 'Ride request deleted successfully']);
    }

    /**
     * @OA\Get(
     *     path="/api/customer/ride-requests/my-requests",
     *     operationId="getMyRideRequests",
     *     tags={"Ride Requests"},
     *     summary="Get user's ride requests",
     *     description="Get a paginated list of the authenticated user's ride requests",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Parameter(name="start_location", in="query", description="Filter by start location", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="end_location", in="query", description="Filter by end location", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="preferred_driver_gender", in="query", description="Filter by preferred driver gender", required=false, @OA\Schema(type="string", enum={"male", "female", "any"})),
     *     @OA\Parameter(name="required_seats", in="query", description="Minimum seats needed", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="departure_date", in="query", description="Filter by departure date", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="departure_time", in="query", description="Filter by departure time", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", description="Items per page", required=false, @OA\Schema(type="integer", default=15)),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/RideRequest")),
     *             @OA\Property(property="meta", type="object",
     *                 @OA\Property(property="current_page", type="integer"),
     *                 @OA\Property(property="last_page", type="integer"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="total", type="integer")
     *             )
     *         )
     *     )
     * )
     */
    public function myRequests(Request $request): AnonymousResourceCollection
    {
        $query = RideRequest::query()
            ->with('user')
            ->where('user_id', Auth::id());

        $this->applyFilters($query, $request);

        $query->orderBy('created_at', 'desc')->orderBy('departure_time', 'asc');

        $requests = $query->paginate((int) $request->input('per_page', 15));

        return RideRequestResource::collection($requests)->additional([
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
                'from' => $requests->firstItem(),
                'to' => $requests->lastItem(),
            ],
        ]);
    }

    protected function applyFilters($query, Request $request): void
    {
        $startLatitude = $request->float('start_latitude');
        $startLongitude = $request->float('start_longitude');
        $endLatitude = $request->float('end_latitude');
        $endLongitude = $request->float('end_longitude');
        $hasStartCoordinates = $request->filled(['start_latitude', 'start_longitude']);
        $hasEndCoordinates = $request->filled(['end_latitude', 'end_longitude']);

        if ($request->filled('start_location') && ! $hasStartCoordinates) {
            $searchTerm = $request->string('start_location')->toString();
            $query->where('start_location', 'like', '%'.$searchTerm.'%');
        }

        if ($request->filled('end_location') && ! $hasEndCoordinates) {
            $query->where('end_location', 'like', '%'.$request->string('end_location')->toString().'%');
        }

        $query->select('ride_requests.*');

        if ($hasStartCoordinates) {
            $query->selectRaw(
                'CASE
                    WHEN start_latitude IS NULL OR start_longitude IS NULL THEN 999999
                    ELSE (
                        6371 * ACOS(
                            COS(RADIANS(?)) * COS(RADIANS(start_latitude))
                            * COS(RADIANS(start_longitude) - RADIANS(?))
                            + SIN(RADIANS(?)) * SIN(RADIANS(start_latitude))
                        )
                    )
                END AS start_distance_km',
                [$startLatitude, $startLongitude, $startLatitude],
            );
        }

        if ($hasEndCoordinates) {
            $query->selectRaw(
                'CASE
                    WHEN end_latitude IS NULL OR end_longitude IS NULL THEN 999999
                    ELSE (
                        6371 * ACOS(
                            COS(RADIANS(?)) * COS(RADIANS(end_latitude))
                            * COS(RADIANS(end_longitude) - RADIANS(?))
                            + SIN(RADIANS(?)) * SIN(RADIANS(end_latitude))
                        )
                    )
                END AS end_distance_km',
                [$endLatitude, $endLongitude, $endLatitude],
            );
        }

        if ($request->filled('preferred_driver_gender')) {
            $query->where('preferred_driver_gender', $request->string('preferred_driver_gender')->toString());
        }

        if ($request->filled('required_seats')) {
            $query->where('required_seats', '>=', (int) $request->input('required_seats'));
        }

        if ($request->filled('departure_date')) {
            $query->whereDate('departure_time', $request->string('departure_date')->toString());
        }

        if ($request->filled('departure_time')) {
            $query->whereTime('departure_time', '>=', $request->string('departure_time')->toString());
        }

        if ($hasStartCoordinates && $hasEndCoordinates) {
            $query->orderByRaw('start_distance_km + end_distance_km asc');
        } elseif ($hasStartCoordinates) {
            $query->orderBy('start_distance_km');
        } elseif ($hasEndCoordinates) {
            $query->orderBy('end_distance_km');
        }
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    protected function buildPayload(array $validated, int $userId, ?RideRequest $existing = null): array
    {
        $scheduleType = $validated['schedule_type'] ?? $existing?->schedule_type ?? 'once';
        $departureDate = $validated['departure_date'] ?? ($scheduleType === 'once' ? $existing?->departure_time?->format('Y-m-d') : '2000-01-01');

        if ($scheduleType !== 'once' && empty($departureDate)) {
            $departureDate = '2000-01-01';
        }

        $departureTime = $validated['departure_time'] ?? $existing?->departure_time?->format('H:i');

        $validated['user_id'] = $userId;
        $validated['schedule_type'] = $scheduleType;
        $validated['selected_days'] = $scheduleType === 'custom' ? ($validated['selected_days'] ?? $existing?->selected_days) : null;
        $validated['departure_time'] = $departureDate.' '.$departureTime.':00';
        $validated['return_time'] = ($validated['is_roundtrip'] ?? $existing?->is_roundtrip)
            ? ($validated['return_time'] ?? $existing?->return_time)
            : null;

        unset($validated['departure_date']);

        return $validated;
    }
}
