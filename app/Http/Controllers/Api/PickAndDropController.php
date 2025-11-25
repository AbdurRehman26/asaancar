<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PickAndDropResource;
use App\Models\PickAndDrop;
use App\Models\PickAndDropStop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PickAndDropController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PickAndDrop::with(['user', 'car', 'stops.city', 'stops.area', 'pickupCity', 'dropoffCity', 'pickupArea', 'dropoffArea'])
            ->where('is_active', true);

        // Filter by start location
        if ($request->has('start_location')) {
            $query->where('start_location', 'like', '%' . $request->start_location . '%');
        }

        // Filter by end location
        if ($request->has('end_location')) {
            $query->where('end_location', 'like', '%' . $request->end_location . '%');
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
                    $hour = (int)$timeParts[0];
                    $minute = (int)$timeParts[1];
                    
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
                        $query->where(function($q) use ($oneHourBefore, $oneHourAfter) {
                            $q->whereTime('departure_time', '>=', $oneHourBefore)
                              ->orWhereTime('departure_time', '<=', $oneHourAfter);
                        });
                    } else {
                        // Normal case - time window within same day
                        $query->where(function($q) use ($oneHourBefore, $oneHourAfter) {
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_location' => 'required|string|max:255',
            'end_location' => 'required|string|max:255',
            'pickup_city_id' => 'required|integer|exists:cities,id',
            'pickup_area_id' => 'required|integer|exists:areas,id',
            'dropoff_city_id' => 'required|integer|exists:cities,id',
            'dropoff_area_id' => 'required|integer|exists:areas,id',
            'departure_time' => 'required|date',
            'available_spaces' => 'required|integer|min:1',
            'driver_gender' => 'required|in:male,female',
            'stops' => 'sometimes|array',
            'stops.*.location' => 'nullable|string|max:255',
            'stops.*.city_id' => 'nullable|integer|exists:cities,id',
            'stops.*.area_id' => 'nullable|integer|exists:areas,id',
            'stops.*.stop_time' => 'required_with:stops|date',
            'stops.*.order' => 'required_with:stops|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        $data['user_id'] = Auth::id();

        $service = PickAndDrop::create($data);

        // Create stops if provided
        if ($request->has('stops') && is_array($request->stops)) {
            // Get Karachi city ID
            $karachi = \App\Models\City::where('name', 'Karachi')->first();
            
            foreach ($request->stops as $stop) {
                PickAndDropStop::create([
                    'pick_and_drop_service_id' => $service->id,
                    'location' => $stop['location'] ?? null,
                    'city_id' => $karachi ? $karachi->id : ($stop['city_id'] ?? null), // Force Karachi
                    'area_id' => $stop['area_id'] ?? null,
                    'stop_time' => $stop['stop_time'],
                    'order' => $stop['order'] ?? 0,
                    'notes' => $stop['notes'] ?? null,
                ]);
            }
        }

        return new PickAndDropResource($service->load(['user', 'car', 'stops.city', 'stops.area']));
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $service = PickAndDrop::with(['user', 'car', 'stops.city', 'stops.area', 'pickupCity', 'dropoffCity', 'pickupArea', 'dropoffArea'])->findOrFail($id);
        return new PickAndDropResource($service);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $service = PickAndDrop::findOrFail($id);

        // Check if user owns this service
        if ($service->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'start_location' => 'sometimes|string|max:255',
            'end_location' => 'sometimes|string|max:255',
            'pickup_city_id' => 'required|integer|exists:cities,id',
            'pickup_area_id' => 'required|integer|exists:areas,id',
            'dropoff_city_id' => 'required|integer|exists:cities,id',
            'dropoff_area_id' => 'required|integer|exists:areas,id',
            'departure_time' => 'sometimes|date',
            'available_spaces' => 'sometimes|integer|min:1',
            'driver_gender' => 'sometimes|in:male,female',
            'stops' => 'sometimes|array',
            'stops.*.location' => 'nullable|string|max:255',
            'stops.*.city_id' => 'nullable|integer|exists:cities,id',
            'stops.*.area_id' => 'nullable|integer|exists:areas,id',
            'stops.*.stop_time' => 'required_with:stops|date',
            'stops.*.order' => 'required_with:stops|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $service->update($request->except(['stops']));

        // Update stops if provided
        if ($request->has('stops')) {
            // Delete existing stops
            $service->stops()->delete();

            // Create new stops
            if (is_array($request->stops)) {
                // Get Karachi city ID
                $karachi = \App\Models\City::where('name', 'Karachi')->first();
                
                foreach ($request->stops as $stop) {
                    PickAndDropStop::create([
                        'pick_and_drop_service_id' => $service->id,
                        'location' => $stop['location'] ?? null,
                        'city_id' => $karachi ? $karachi->id : ($stop['city_id'] ?? null), // Force Karachi
                        'area_id' => $stop['area_id'] ?? null,
                        'stop_time' => $stop['stop_time'],
                        'order' => $stop['order'] ?? 0,
                        'notes' => $stop['notes'] ?? null,
                    ]);
                }
            }
        }

        return new PickAndDropResource($service->load(['user', 'car', 'stops.city', 'stops.area']));
    }

    /**
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
     * Get user's own pick and drop services
     */
    public function myServices(Request $request)
    {
        $query = PickAndDrop::with(['user', 'car', 'stops.city', 'stops.area', 'pickupCity', 'dropoffCity', 'pickupArea', 'dropoffArea'])
            ->where('user_id', Auth::id());

        // Filter by start location
        if ($request->has('start_location')) {
            $query->where('start_location', 'like', '%' . $request->start_location . '%');
        }

        // Filter by end location
        if ($request->has('end_location')) {
            $query->where('end_location', 'like', '%' . $request->end_location . '%');
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
                    $hour = (int)$timeParts[0];
                    $minute = (int)$timeParts[1];
                    
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
                        $query->where(function($q) use ($oneHourBefore, $oneHourAfter) {
                            $q->whereTime('departure_time', '>=', $oneHourBefore)
                              ->orWhereTime('departure_time', '<=', $oneHourAfter);
                        });
                    } else {
                        // Normal case - time window within same day
                        $query->where(function($q) use ($oneHourBefore, $oneHourAfter) {
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
