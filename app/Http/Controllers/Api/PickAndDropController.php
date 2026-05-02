<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PickAndDropResource;
use App\Models\PickAndDrop;
use App\Models\PickAndDropStop;
use App\Support\DepartureDateNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * @OA\Tag(
 *     name="Pick & Drop",
 *     description="API Endpoints for pick and drop services"
 * )
 */
class PickAndDropController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/pick-and-drop",
     *     operationId="getPickAndDropServices",
     *     tags={"Pick & Drop"},
     *     summary="List pick and drop services",
     *     description="Get a paginated list of active pick and drop services with optional filters",
     *
     *     @OA\Parameter(name="start_location", in="query", description="Filter by start location", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="end_location", in="query", description="Filter by end location", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="driver_gender", in="query", description="Filter by driver gender", required=false, @OA\Schema(type="string", enum={"male", "female"})),
     *     @OA\Parameter(name="user_id", in="query", description="Filter by driver user ID", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="min_spaces", in="query", description="Minimum available spaces", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="departure_date", in="query", description="Filter by departure date (YYYY-MM-DD)", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="departure_time", in="query", description="Filter by departure time (HH:MM)", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="is_roundtrip", in="query", description="Filter by roundtrip services", required=false, @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="schedule_type", in="query", description="Filter by schedule type", required=false, @OA\Schema(type="string", enum={"once", "everyday", "weekdays", "weekends", "custom"})),
     *     @OA\Parameter(name="per_page", in="query", description="Items per page", required=false, @OA\Schema(type="integer", default=15)),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/PickAndDrop")),
     *             @OA\Property(property="meta", type="object",
     *                 @OA\Property(property="current_page", type="integer"),
     *                 @OA\Property(property="last_page", type="integer"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="total", type="integer")
     *             )
     *         )
     *     )
     * )
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $departureDate = DepartureDateNormalizer::normalize($request->input('departure_date'));

        $query = PickAndDrop::with(['user', 'stops.city', 'stops.area', 'pickupCity', 'dropoffCity', 'pickupArea', 'dropoffArea'])
            ->where('is_active', true);

        $startLatitude = $request->float('start_latitude');
        $startLongitude = $request->float('start_longitude');
        $endLatitude = $request->float('end_latitude');
        $endLongitude = $request->float('end_longitude');
        $hasStartCoordinates = $request->filled(['start_latitude', 'start_longitude']);
        $hasEndCoordinates = $request->filled(['end_latitude', 'end_longitude']);

        // Filter by start location (including stops, stop areas, and stop cities)
        if ($request->has('start_location') && ! $hasStartCoordinates) {
            $searchTerm = $request->start_location;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('start_location', 'like', '%'.$searchTerm.'%')
                    ->orWhereHas('stops', function ($stopQuery) use ($searchTerm) {
                        $stopQuery->where('location', 'like', '%'.$searchTerm.'%')
                            ->orWhereHas('area', function ($areaQuery) use ($searchTerm) {
                                $areaQuery->where('name', 'like', '%'.$searchTerm.'%');
                            })
                            ->orWhereHas('city', function ($cityQuery) use ($searchTerm) {
                                $cityQuery->where('name', 'like', '%'.$searchTerm.'%');
                            });
                    });
            });
        }

        // Filter by end location (including stops, stop areas, and stop cities)
        if ($request->has('end_location') && ! $hasEndCoordinates) {
            $searchTerm = $request->end_location;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('end_location', 'like', '%'.$searchTerm.'%')
                    ->orWhereHas('stops', function ($stopQuery) use ($searchTerm) {
                        $stopQuery->where('location', 'like', '%'.$searchTerm.'%')
                            ->orWhereHas('area', function ($areaQuery) use ($searchTerm) {
                                $areaQuery->where('name', 'like', '%'.$searchTerm.'%');
                            })
                            ->orWhereHas('city', function ($cityQuery) use ($searchTerm) {
                                $cityQuery->where('name', 'like', '%'.$searchTerm.'%');
                            });
                    });
            });
        }

        $query->select('pick_and_drop_services.*');

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

        // Filter by driver gender
        if ($request->has('driver_gender')) {
            $query->where('driver_gender', $request->driver_gender);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', (int) $request->user_id);
        }

        // Filter by available spaces
        if ($request->has('min_spaces')) {
            $query->where('available_spaces', '>=', $request->min_spaces);
        }

        // Filter by departure date
        if ($departureDate) {
            $query->whereDate('departure_time', $departureDate);
        }

        // Filter by departure time (show services 1 hour before and after selected time)
        if ($request->has('departure_time')) {
            $selectedTime = $request->departure_time; // Format: HH:MM
            try {
                // Parse the time
                $timeParts = explode(':', $selectedTime);
                if (count($timeParts) === 2) {
                    $hour = (int) $timeParts[0];
                    $minute = (int) $timeParts[1];

                    // Calculate 1 hour before and after
                    $oneHourBeforeHour = $hour - 1;
                    $oneHourBeforeMinute = $minute;
                    $oneHourAfterHour = $hour + 1;
                    $oneHourAfterMinute = $minute;

                    // Handle hour wraparound (before midnight)
                    if ($oneHourBeforeHour < 0) {
                        $oneHourBeforeHour = 23;
                    }

                    // Handle hour wraparound (after midnight)
                    if ($oneHourAfterHour > 23) {
                        $oneHourAfterHour = 0;
                    }

                    $oneHourBefore = sprintf('%02d:%02d:00', $oneHourBeforeHour, $oneHourBeforeMinute);
                    $oneHourAfter = sprintf('%02d:%02d:00', $oneHourAfterHour, $oneHourAfterMinute);

                    // If the window crosses midnight (e.g., 23:00 to 01:00), we need special handling
                    if ($oneHourBeforeHour > $oneHourAfterHour) {
                        // Window crosses midnight - use OR condition
                        $query->where(function ($q) use ($oneHourBefore, $oneHourAfter) {
                            $q->whereTime('departure_time', '>=', $oneHourBefore)
                                ->orWhereTime('departure_time', '<=', $oneHourAfter);
                        });
                    } else {
                        // Normal case - time window within same day
                        $query->where(function ($q) use ($oneHourBefore, $oneHourAfter) {
                            $q->whereTime('departure_time', '>=', $oneHourBefore)
                                ->whereTime('departure_time', '<=', $oneHourAfter);
                        });
                    }
                }
            } catch (\Exception $e) {
                // If time parsing fails, fall back to simple time comparison
                $query->whereTime('departure_time', '>=', $selectedTime);
            }
        }

        $query->orderBy('is_system_generated', 'asc');

        if ($hasStartCoordinates && $hasEndCoordinates) {
            $query->orderByRaw('start_distance_km + end_distance_km asc');
        } elseif ($hasStartCoordinates) {
            $query->orderBy('start_distance_km');
        } elseif ($hasEndCoordinates) {
            $query->orderBy('end_distance_km');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->input('per_page', 15);
        $services = $query->orderBy('departure_time', 'asc')->paginate($perPage);

        // Return paginated resource with explicit pagination metadata
        return PickAndDropResource::collection($services)->additional([
            'meta' => [
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
                'from' => $services->firstItem(),
                'to' => $services->lastItem(),
            ],
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/customer/pick-and-drop",
     *     operationId="createPickAndDropService",
     *     tags={"Pick & Drop"},
     *     summary="Create pick and drop service",
     *     description="Create a new pick and drop service",
     *     security={{"sanctum": {}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"start_location", "end_location", "pickup_city_id", "pickup_area_id", "dropoff_city_id", "dropoff_area_id", "departure_date", "departure_time", "available_spaces", "driver_gender"},
     *
     *             @OA\Property(property="start_location", type="string", example="Karachi Airport"),
     *             @OA\Property(property="end_location", type="string", example="Clifton Beach"),
     *             @OA\Property(property="pickup_city_id", type="integer", example=1),
     *             @OA\Property(property="pickup_area_id", type="integer", example=1),
     *             @OA\Property(property="dropoff_city_id", type="integer", example=1),
     *             @OA\Property(property="dropoff_area_id", type="integer", example=2),
     *             @OA\Property(property="departure_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="departure_time", type="string", format="time", example="10:00"),
     *             @OA\Property(property="available_spaces", type="integer", example=4),
     *             @OA\Property(property="driver_gender", type="string", enum={"male", "female"}, example="male"),
     *             @OA\Property(property="stops", type="array", @OA\Items(type="object",
     *                 @OA\Property(property="location", type="string"),
     *                 @OA\Property(property="city_id", type="integer"),
     *                 @OA\Property(property="area_id", type="integer"),
     *                 @OA\Property(property="stop_time", type="string", format="date-time"),
     *                 @OA\Property(property="order", type="integer"),
     *                 @OA\Property(property="notes", type="string", nullable=true)
     *             ))
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Service created successfully",
     *
     *         @OA\JsonContent(ref="#/components/schemas/PickAndDrop")
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error")
     * )
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($request->exists('departure_date')) {
            $request->merge([
                'departure_date' => DepartureDateNormalizer::normalize($request->input('departure_date')),
            ]);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'contact' => 'nullable|string|max:255',
            'start_location' => 'required|string|max:255',
            'end_location' => 'required|string|max:255',
            'start_place_id' => 'nullable|string|max:255',
            'start_latitude' => 'nullable|numeric',
            'start_longitude' => 'nullable|numeric',
            'end_place_id' => 'nullable|string|max:255',
            'end_latitude' => 'nullable|numeric',
            'end_longitude' => 'nullable|numeric',
            'pickup_city_id' => 'nullable|integer|exists:cities,id',
            'pickup_area_id' => 'nullable|integer|exists:areas,id',
            'dropoff_city_id' => 'nullable|integer|exists:cities,id',
            'dropoff_area_id' => 'nullable|integer|exists:areas,id',
            'departure_date' => [
                Rule::requiredIf(fn (): bool => $request->input('schedule_type', 'once') === 'once'),
                'date_format:Y-m-d',
            ],
            'departure_time' => 'required|date_format:H:i',
            'available_spaces' => 'required|integer|min:1',
            'driver_gender' => 'required|in:male,female',
            'schedule_type' => 'nullable|string|in:once,everyday,weekdays,weekends,custom',
            'selected_days' => 'nullable|array',
            'is_roundtrip' => 'boolean',
            'return_time' => 'nullable|date_format:H:i',
            'stops' => 'sometimes|array',
            'stops.*.location' => 'required_with:stops|string|max:255',
            'stops.*.stop_area' => 'nullable|string|max:255',
            'stops.*.place_id' => 'nullable|string|max:255',
            'stops.*.latitude' => 'nullable|numeric',
            'stops.*.longitude' => 'nullable|numeric',
            'stops.*.city_id' => 'nullable|integer|exists:cities,id',
            'stops.*.area_id' => 'nullable|integer|exists:areas,id',
            'stops.*.stop_time' => 'required_with:stops|date',
            'stops.*.order' => 'required_with:stops|integer|min:0',
        ]);

        $validator->after(function ($validator) use ($request) {
            if ($request->input('schedule_type') !== 'once') {
                return;
            }

            if ($request->filled('departure_date')) {
                return;
            }

            $validator->errors()->add('departure_date', 'The departure date field is required when schedule type is once.');
        });

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except(['departure_date', 'departure_time']);
        $data['user_id'] = Auth::id();
        $departureDate = $request->input('departure_date');

        if ($departureDate === null && $request->input('schedule_type', 'once') !== 'once') {
            $departureDate = '2000-01-01';
        }

        $data['departure_time'] = $departureDate.' '.$request->input('departure_time').':00';

        $service = PickAndDrop::create($data);

        // Create stops if provided
        if ($request->has('stops') && is_array($request->stops)) {
            foreach ($request->stops as $stop) {
                PickAndDropStop::create([
                    'pick_and_drop_service_id' => $service->id,
                    'location' => $stop['location'] ?? null,
                    'stop_area' => $stop['stop_area'] ?? null,
                    'place_id' => $stop['place_id'] ?? null,
                    'latitude' => $stop['latitude'] ?? null,
                    'longitude' => $stop['longitude'] ?? null,
                    'city_id' => $stop['city_id'] ?? null,
                    'area_id' => $stop['area_id'] ?? null,
                    'stop_time' => $stop['stop_time'],
                    'order' => $stop['order'] ?? 0,
                    'notes' => $stop['notes'] ?? null,
                ]);
            }
        }

        return new PickAndDropResource($service->fresh()->load(['user', 'stops.city', 'stops.area']));
    }

    /**
     * @OA\Get(
     *     path="/api/pick-and-drop/{id}",
     *     operationId="getPickAndDropService",
     *     tags={"Pick & Drop"},
     *     summary="Get pick and drop service details",
     *     description="Get detailed information about a specific pick and drop service",
     *
     *     @OA\Parameter(name="id", in="path", required=true, description="Service ID", @OA\Schema(type="integer")),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(ref="#/components/schemas/PickAndDrop")
     *     ),
     *
     *     @OA\Response(response=404, description="Service not found")
     * )
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $service = PickAndDrop::with(['user', 'stops.city', 'stops.area', 'pickupCity', 'dropoffCity', 'pickupArea', 'dropoffArea'])->findOrFail($id);

        return new PickAndDropResource($service);
    }

    /**
     * @OA\Put(
     *     path="/api/customer/pick-and-drop/{id}",
     *     operationId="updatePickAndDropService",
     *     tags={"Pick & Drop"},
     *     summary="Update pick and drop service",
     *     description="Update an existing pick and drop service (only owner can update)",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Parameter(name="id", in="path", required=true, description="Service ID", @OA\Schema(type="integer")),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="start_location", type="string", example="Karachi Airport"),
     *             @OA\Property(property="end_location", type="string", example="Clifton Beach"),
     *             @OA\Property(property="pickup_city_id", type="integer", example=1),
     *             @OA\Property(property="pickup_area_id", type="integer", example=1),
     *             @OA\Property(property="dropoff_city_id", type="integer", example=1),
     *             @OA\Property(property="dropoff_area_id", type="integer", example=2),
     *             @OA\Property(property="departure_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="departure_time", type="string", format="time", example="10:00"),
     *             @OA\Property(property="available_spaces", type="integer", example=4),
     *             @OA\Property(property="driver_gender", type="string", enum={"male", "female"}, example="male"),
     *             @OA\Property(property="stops", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Service updated successfully",
     *
     *         @OA\JsonContent(ref="#/components/schemas/PickAndDrop")
     *     ),
     *
     *     @OA\Response(response=403, description="Unauthorized - not the owner"),
     *     @OA\Response(response=404, description="Service not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        if ($request->exists('departure_date')) {
            $request->merge([
                'departure_date' => DepartureDateNormalizer::normalize($request->input('departure_date')),
            ]);
        }

        $service = PickAndDrop::findOrFail($id);

        // Check if user owns this service
        if ($service->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'contact' => 'nullable|string|max:255',
            'start_location' => 'sometimes|string|max:255',
            'end_location' => 'sometimes|string|max:255',
            'start_place_id' => 'sometimes|nullable|string|max:255',
            'start_latitude' => 'sometimes|nullable|numeric',
            'start_longitude' => 'sometimes|nullable|numeric',
            'end_place_id' => 'sometimes|nullable|string|max:255',
            'end_latitude' => 'sometimes|nullable|numeric',
            'end_longitude' => 'sometimes|nullable|numeric',
            'pickup_city_id' => 'sometimes|nullable|integer|exists:cities,id',
            'pickup_area_id' => 'sometimes|nullable|integer|exists:areas,id',
            'dropoff_city_id' => 'sometimes|nullable|integer|exists:cities,id',
            'dropoff_area_id' => 'sometimes|nullable|integer|exists:areas,id',
            'departure_date' => 'sometimes|date_format:Y-m-d',
            'departure_time' => 'sometimes|date_format:H:i',
            'schedule_type' => 'nullable|string|in:once,everyday,weekdays,weekends,custom',
            'selected_days' => 'nullable|array',
            'is_roundtrip' => 'boolean',
            'return_time' => 'nullable|date_format:H:i',
            'description' => 'nullable|string',
            'available_spaces' => 'sometimes|integer|min:1',
            'driver_gender' => 'sometimes|in:male,female',
            'stops' => 'sometimes|array',
            'stops.*.location' => 'required_with:stops|string|max:255',
            'stops.*.stop_area' => 'nullable|string|max:255',
            'stops.*.place_id' => 'nullable|string|max:255',
            'stops.*.latitude' => 'nullable|numeric',
            'stops.*.longitude' => 'nullable|numeric',
            'stops.*.city_id' => 'nullable|integer|exists:cities,id',
            'stops.*.area_id' => 'nullable|integer|exists:areas,id',
            'stops.*.stop_time' => 'required_with:stops|date',
            'stops.*.order' => 'required_with:stops|integer|min:0',
        ]);

        $validator->after(function ($validator) use ($request) {
            if ($request->input('schedule_type') !== 'once') {
                return;
            }

            if ($request->filled('departure_date')) {
                return;
            }

            $validator->errors()->add('departure_date', 'The departure date field is required when schedule type is once.');
        });

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $updateData = $request->except(['stops', 'departure_date', 'departure_time']);

        if ($request->has('departure_date') && $request->has('departure_time')) {
            $updateData['departure_time'] = $request->input('departure_date').' '.$request->input('departure_time').':00';
        } elseif ($request->has('departure_date')) {
            $updateData['departure_time'] = $request->input('departure_date').' '.$service->departure_time->format('H:i:s');
        } elseif ($request->has('departure_time')) {
            $updateData['departure_time'] = $service->departure_time->format('Y-m-d').' '.$request->input('departure_time').':00';
        }

        $service->update($updateData);

        // Update stops if provided
        if ($request->has('stops')) {
            // Delete existing stops
            $service->stops()->delete();

            // Create new stops
            if (is_array($request->stops)) {
                foreach ($request->stops as $stop) {
                    PickAndDropStop::create([
                        'pick_and_drop_service_id' => $service->id,
                        'location' => $stop['location'] ?? null,
                        'stop_area' => $stop['stop_area'] ?? null,
                        'place_id' => $stop['place_id'] ?? null,
                        'latitude' => $stop['latitude'] ?? null,
                        'longitude' => $stop['longitude'] ?? null,
                        'city_id' => $stop['city_id'] ?? null,
                        'area_id' => $stop['area_id'] ?? null,
                        'stop_time' => $stop['stop_time'],
                        'order' => $stop['order'] ?? 0,
                        'notes' => $stop['notes'] ?? null,
                    ]);
                }
            }
        }

        return new PickAndDropResource($service->load(['user', 'stops.city', 'stops.area']));
    }

    /**
     * @OA\Delete(
     *     path="/api/customer/pick-and-drop/{id}",
     *     operationId="deletePickAndDropService",
     *     tags={"Pick & Drop"},
     *     summary="Delete pick and drop service",
     *     description="Delete a pick and drop service (only owner can delete)",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Parameter(name="id", in="path", required=true, description="Service ID", @OA\Schema(type="integer")),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Service deleted successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Service deleted successfully")
     *         )
     *     ),
     *
     *     @OA\Response(response=403, description="Unauthorized - not the owner"),
     *     @OA\Response(response=404, description="Service not found")
     * )
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $service = PickAndDrop::findOrFail($id);

        // Check if user owns this service
        if ($service->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $service->delete();

        return response()->json(['message' => 'Service deleted successfully'], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/customer/pick-and-drop/my-services",
     *     operationId="getMyPickAndDropServices",
     *     tags={"Pick & Drop"},
     *     summary="Get user's pick and drop services",
     *     description="Get a paginated list of the authenticated user's pick and drop services",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Parameter(name="start_location", in="query", description="Filter by start location", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="end_location", in="query", description="Filter by end location", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="driver_gender", in="query", description="Filter by driver gender", required=false, @OA\Schema(type="string", enum={"male", "female"})),
     *     @OA\Parameter(name="min_spaces", in="query", description="Minimum available spaces", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="departure_date", in="query", description="Filter by departure date", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="per_page", in="query", description="Items per page", required=false, @OA\Schema(type="integer", default=15)),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/PickAndDrop")),
     *             @OA\Property(property="meta", type="object",
     *                 @OA\Property(property="current_page", type="integer"),
     *                 @OA\Property(property="last_page", type="integer"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="total", type="integer")
     *             )
     *         )
     *     )
     * )
     * Get user's own pick and drop services
     */
    public function myServices(Request $request)
    {
        $query = PickAndDrop::with(['user', 'stops.city', 'stops.area', 'pickupCity', 'dropoffCity', 'pickupArea', 'dropoffArea'])
            ->where('user_id', Auth::id());

        // Filter by start location (including stops, stop areas, and stop cities)
        if ($request->has('start_location')) {
            $searchTerm = $request->start_location;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('start_location', 'like', '%'.$searchTerm.'%')
                    ->orWhereHas('stops', function ($stopQuery) use ($searchTerm) {
                        $stopQuery->where('location', 'like', '%'.$searchTerm.'%')
                            ->orWhereHas('area', function ($areaQuery) use ($searchTerm) {
                                $areaQuery->where('name', 'like', '%'.$searchTerm.'%');
                            })
                            ->orWhereHas('city', function ($cityQuery) use ($searchTerm) {
                                $cityQuery->where('name', 'like', '%'.$searchTerm.'%');
                            });
                    });
            });
        }

        // Filter by end location (including stops, stop areas, and stop cities)
        if ($request->has('end_location')) {
            $searchTerm = $request->end_location;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('end_location', 'like', '%'.$searchTerm.'%')
                    ->orWhereHas('stops', function ($stopQuery) use ($searchTerm) {
                        $stopQuery->where('location', 'like', '%'.$searchTerm.'%')
                            ->orWhereHas('area', function ($areaQuery) use ($searchTerm) {
                                $areaQuery->where('name', 'like', '%'.$searchTerm.'%');
                            })
                            ->orWhereHas('city', function ($cityQuery) use ($searchTerm) {
                                $cityQuery->where('name', 'like', '%'.$searchTerm.'%');
                            });
                    });
            });
        }

        // Filter by driver gender
        if ($request->has('driver_gender')) {
            $query->where('driver_gender', $request->driver_gender);
        }

        // Filter by available spaces
        if ($request->has('min_spaces')) {
            $query->where('available_spaces', '>=', $request->min_spaces);
        }

        // Filter by departure date
        if ($request->has('departure_date')) {
            $query->whereDate('departure_time', $request->departure_date);
        }

        // Filter by departure time (show services 1 hour before and after selected time)
        if ($request->has('departure_time')) {
            $selectedTime = $request->departure_time; // Format: HH:MM
            try {
                // Parse the time
                $timeParts = explode(':', $selectedTime);
                if (count($timeParts) === 2) {
                    $hour = (int) $timeParts[0];
                    $minute = (int) $timeParts[1];

                    // Calculate 1 hour before and after
                    $oneHourBeforeHour = $hour - 1;
                    $oneHourBeforeMinute = $minute;
                    $oneHourAfterHour = $hour + 1;
                    $oneHourAfterMinute = $minute;

                    // Handle hour wraparound (before midnight)
                    if ($oneHourBeforeHour < 0) {
                        $oneHourBeforeHour = 23;
                    }

                    // Handle hour wraparound (after midnight)
                    if ($oneHourAfterHour > 23) {
                        $oneHourAfterHour = 0;
                    }

                    $oneHourBefore = sprintf('%02d:%02d:00', $oneHourBeforeHour, $oneHourBeforeMinute);
                    $oneHourAfter = sprintf('%02d:%02d:00', $oneHourAfterHour, $oneHourAfterMinute);

                    // If the window crosses midnight (e.g., 23:00 to 01:00), we need special handling
                    if ($oneHourBeforeHour > $oneHourAfterHour) {
                        // Window crosses midnight - use OR condition
                        $query->where(function ($q) use ($oneHourBefore, $oneHourAfter) {
                            $q->whereTime('departure_time', '>=', $oneHourBefore)
                                ->orWhereTime('departure_time', '<=', $oneHourAfter);
                        });
                    } else {
                        // Normal case - time window within same day
                        $query->where(function ($q) use ($oneHourBefore, $oneHourAfter) {
                            $q->whereTime('departure_time', '>=', $oneHourBefore)
                                ->whereTime('departure_time', '<=', $oneHourAfter);
                        });
                    }
                }
            } catch (\Exception $e) {
                // If time parsing fails, fall back to simple time comparison
                $query->whereTime('departure_time', '>=', $selectedTime);
            }
        }

        $perPage = $request->input('per_page', 15);
        $services = $query->orderBy('departure_time', 'desc')->paginate($perPage);

        // Return paginated resource with explicit pagination metadata
        return PickAndDropResource::collection($services)->additional([
            'meta' => [
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
                'from' => $services->firstItem(),
                'to' => $services->lastItem(),
            ],
        ]);
    }
}
