<?php

namespace App\Services\V1\Vehicle;

use App\Models\VehicleMake;
use App\Models\VehicleModel;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\QueryBuilder;

class VehicleAttributeService
{
    public function getVehicleMakes(): Collection
    {
        return QueryBuilder::for(VehicleMake::class)
            ->allowedFilters(VehicleMake::getAllowedFilters())->get();
    }

    public function getVehicleModels(): Collection
    {
        return QueryBuilder::for(VehicleModel::class)
            ->allowedFilters(VehicleModel::getAllowedFilters())
            ->get();
    }
}
