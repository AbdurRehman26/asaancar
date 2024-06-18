<?php

namespace App\Http\Controllers\V1;

use App\Http\Resources\V1\VehicleAttribute\VehicleMakeResource;
use App\Http\Resources\V1\VehicleAttribute\VehicleModelResource;
use App\Models\VehicleMake;
use App\Models\VehicleType;
use App\Services\V1\VehicleAttributeService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controller;

class VehicleAttributeController extends Controller
{
    public function __construct(public VehicleAttributeService $vehicleAttributeService)
    {
    }

    public function getVehicleMakes(VehicleType $vehicleType): AnonymousResourceCollection
    {
        return VehicleMakeResource::collection(
            $this->vehicleAttributeService->getVehicleMakes($vehicleType)
        );
    }

    public function getVehicleModels(VehicleMake $vehicleMake): AnonymousResourceCollection
    {
        return VehicleModelResource::collection(
            $this->vehicleAttributeService->getVehicleModels($vehicleMake)
        );
    }
}
