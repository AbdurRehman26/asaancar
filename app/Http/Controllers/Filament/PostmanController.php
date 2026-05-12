<?php

namespace App\Http\Controllers\Filament;

use App\Http\Controllers\Controller;
use App\Services\AdminPickAndDropTestingService;
use App\Services\GoogleAddressComponentLookupService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PostmanController extends Controller
{
    /**
     * Execute a test API request through the Postman widget
     */
    public function executeRequest(
        Request $request,
        GoogleAddressComponentLookupService $lookupService,
        AdminPickAndDropTestingService $pickAndDropTestingService,
    ) {
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
                $result = $pickAndDropTestingService->execute($payload, $lookupService);

                return response()->json([
                    'success' => true,
                    'message' => $result['message'],
                    'status' => 'success',
                    'data' => $result['data'],
                ], 201);
            }

            return response()->json(['error' => 'Invalid API type'], 400);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'validation_errors' => $e->errors(),
                'status' => 'validation_error',
            ], 422);
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
    public function getPickAndDropTemplate(AdminPickAndDropTestingService $pickAndDropTestingService)
    {
        return response()->json([
            'api_type' => 'pick_and_drop',
            'template' => $pickAndDropTestingService->template(),
        ]);
    }
}
