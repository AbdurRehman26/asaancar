<?php

namespace App\Services\V1\Vehicle;

use App\Models\Vehicle;
use Illuminate\Support\Collection;
use Spatie\QueryBuilder\QueryBuilder;

class VehicleService
{
    public function getVehicles(): Collection
    {
        return QueryBuilder::for(Vehicle::class)
            ->allowedFilters(Vehicle::getAllowedFilters())
            ->get();
    }

    public function create(array $data): Vehicle
    {
        return Vehicle::create($data);
    }

    public function update(Vehicle $vehicle, array $data): Vehicle
    {
        $vehicle->update($data);
        return $vehicle->refresh();
    }
}
