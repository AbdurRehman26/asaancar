<?php

namespace App\Services\V1;

use App\Models\VehicleMake;
use App\Models\VehicleModel;
use App\Models\VehicleType;
use Illuminate\Database\Eloquent\Collection;

class VehicleAttributeService
{
    public function getVehicleMakes(VehicleType $vehicleMake): Collection
    {
        return VehicleMake::vehicleType($vehicleMake)->get();
    }

    public function getVehicleModels(VehicleMake $vehicleMake): Collection
    {
        return VehicleModel::vehicleMake($vehicleMake)->get();
    }
}
