<?php

namespace App\Http\Controllers\V1;

use App\Http\Requests\V1\Vehicle\VehicleStoreRequest;
use App\Http\Requests\V1\Vehicle\VehicleUpdateRequest;
use App\Http\Resources\V1\Vehicle\VehicleResource;
use App\Models\Vehicle;
use App\Services\V1\Vehicle\VehicleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controller;
use Symfony\Component\HttpFoundation\Response;

class VehicleController extends Controller
{
    public function __construct(public VehicleService $vehicleService)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        return VehicleResource::collection(
            $this->vehicleService->getVehicles()
        );
    }

    public function store(VehicleStoreRequest $vehicleStoreRequest): VehicleResource|JsonResponse
    {
        try {
            $vehicle = $this->vehicleService->store(array_merge(
                $vehicleStoreRequest->only(
                    'vehicle_type_id',
                    'vehicle_model_id',
                    'details',
                    'color',
                    'year_of_manufacture',
                    'number_plate'
                ),
                [
                    'user_id' => auth()->user()->id
                ]
            ));

            return new VehicleResource($vehicle);
        }catch (\Exception $exception){
            return new JsonResponse(
                [
                    'error' => $exception->getMessage(),
                ],
                Response::HTTP_BAD_REQUEST
            );
        }
    }

    public function update(Vehicle $vehicle, VehicleUpdateRequest $vehicleUpdateRequest): VehicleResource|JsonResponse
    {
        try {
            $this->vehicleService->update($vehicle, $vehicleUpdateRequest->only(
                'vehicle_type_id',
                'vehicle_model_id',
                'details',
                'color',
                'year_of_manufacture',
                'number_plate'
            ));

            return new VehicleResource($vehicle->refresh());
        }catch (\Exception $exception){
            return new JsonResponse(
                [
                    'error' => $exception->getMessage(),
                ],
                Response::HTTP_BAD_REQUEST
            );
        }
    }
}
