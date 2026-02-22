<?php

namespace App\Http\Controllers\Filament;

use App\Http\Controllers\Controller;
use App\Models\PickAndDrop;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PostmanController extends Controller
{
    /**
     * Execute a test API request through the Postman widget
     */
    public function executeRequest(Request $request)
    {
        // Only allow admin users (role_id = 1)
        $user = Auth::user();
        if (! $user || ! $user->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized. Only admins can execute API requests.'], 403);
        }

        try {
            $validated = Validator::make($request->all(), [
                'api_type' => 'required|in:pick_and_drop',
                'payload' => 'required',
            ])->validate();

            $apiType = $validated['api_type'];

            // Handle both string JSON and already parsed JSON
            if (is_string($validated['payload'])) {
                $payload = json_decode($validated['payload'], true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    return response()->json([
                        'success' => false,
                        'error' => 'Invalid JSON format: '.json_last_error_msg(),
                        'status' => 'error',
                    ], 400);
                }
            } else {
                $payload = $validated['payload'];
            }

            if ($apiType === 'pick_and_drop') {
                return $this->executePickAndDrop($payload);
            }

            return response()->json(['error' => 'Invalid API type'], 400);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'status' => 'error',
            ], 400);
        }
    }

    /**
     * Execute Pick & Drop API test
     */
    private function executePickAndDrop(array $payload)
    {
        try {
            // Validate required fields for Pick & Drop
            $rules = [
                'user_id' => 'required|integer|exists:users,id',
                'car_id' => 'nullable',
                'start_location' => 'required|string|max:255',
                'end_location' => 'required|string|max:255',
                'pickup_city_id' => 'required|integer|exists:cities,id',
                'dropoff_city_id' => 'required|integer|exists:cities,id',
                'available_spaces' => 'required|integer|min:1',
                'driver_gender' => 'required|in:male,female',
                'departure_time' => 'required|date_format:Y-m-d H:i:s',
                'price_per_person' => 'required|numeric|min:0',
                'currency' => 'required|string|max:3',
                'is_active' => 'required|boolean',
                'schedule_type' => 'required|in:once,everyday,weekdays,weekends,custom',
            ];

            $validator = Validator::make($payload, $rules);
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Validation failed',
                    'validation_errors' => $validator->errors(),
                    'status' => 'validation_error',
                ], 422);
            }

            // Create the Pick & Drop record
            $pickAndDrop = PickAndDrop::create([
                'user_id' => $payload['user_id'],
                'car_id' => null,
                'start_location' => $payload['start_location'],
                'end_location' => $payload['end_location'],
                'pickup_city_id' => $payload['pickup_city_id'],
                'dropoff_city_id' => $payload['dropoff_city_id'],
                'pickup_area_id' => $payload['pickup_area_id'] ?? null,
                'dropoff_area_id' => $payload['dropoff_area_id'] ?? null,
                'available_spaces' => $payload['available_spaces'],
                'driver_gender' => $payload['driver_gender'],
                'car_brand' => $payload['car_brand'] ?? null,
                'car_model' => $payload['car_model'] ?? null,
                'car_color' => $payload['car_color'] ?? null,
                'car_seats' => $payload['car_seats'] ?? null,
                'car_transmission' => $payload['car_transmission'] ?? null,
                'car_fuel_type' => $payload['car_fuel_type'] ?? null,
                'departure_time' => $payload['departure_time'],
                'return_time' => $payload['return_time'] ?? null,
                'description' => $payload['description'] ?? null,
                'price_per_person' => $payload['price_per_person'],
                'currency' => $payload['currency'],
                'is_active' => $payload['is_active'],
                'is_roundtrip' => $payload['is_roundtrip'] ?? false,
                'schedule_type' => $payload['schedule_type'],
                'selected_days' => isset($payload['selected_days']) ? json_encode($payload['selected_days']) : null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pick & Drop service created successfully',
                'status' => 'success',
                'data' => $pickAndDrop,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'status' => 'error',
            ], 400);
        }
    }

    /**
     * Get API template for Pick & Drop
     */
    public function getPickAndDropTemplate()
    {
        return response()->json([
            'api_type' => 'pick_and_drop',
            'template' => [
                'user_id' => 1,
                'car_id' => null,
                'start_location' => 'Karachi Airport',
                'end_location' => 'Clifton Beach',
                'pickup_city_id' => 1,
                'dropoff_city_id' => 1,
                'pickup_area_id' => null,
                'dropoff_area_id' => null,
                'available_spaces' => 4,
                'driver_gender' => 'male',
                'car_brand' => 'Toyota',
                'car_model' => 'Corolla',
                'car_color' => 'White',
                'car_seats' => 5,
                'car_transmission' => 'automatic',
                'car_fuel_type' => 'petrol',
                'departure_time' => '2024-12-20 10:00:00',
                'return_time' => '18:00:00',
                'description' => 'Comfortable ride with AC',
                'price_per_person' => 500,
                'currency' => 'PKR',
                'is_active' => true,
                'is_roundtrip' => false,
                'schedule_type' => 'once',
                'selected_days' => [],
            ],
        ]);
    }
}
