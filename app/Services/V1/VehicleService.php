<?php

namespace App\Services\V1;

use App\Models\Vehicle;

class VehicleService
{
    public function getVehicles()
    {
        return Vehicle::forUser(auth()->user())->get();
    }
}
