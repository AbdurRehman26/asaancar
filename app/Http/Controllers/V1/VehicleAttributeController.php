<?php

namespace App\Http\Controllers\V1;

use App\Http\Resources\V1\VehicleAttribute\VehicleMakeResource;
use App\Http\Resources\V1\VehicleAttribute\VehicleModelResource;
use App\Services\V1\Vehicle\VehicleAttributeService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controller;

class VehicleAttributeController extends Controller
{
    public function __construct(public VehicleAttributeService $vehicleAttributeService)
    {
    }

    public function getVehicleMakes(): AnonymousResourceCollection
    {
        return VehicleMakeResource::collection(
            $this->vehicleAttributeService->getVehicleMakes()
        );
    }

    public function getVehicleModels(): AnonymousResourceCollection
    {
        return VehicleModelResource::collection(
            $this->vehicleAttributeService->getVehicleModels()
        );
    }
}
