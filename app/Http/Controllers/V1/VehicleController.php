<?php

namespace App\Http\Controllers\V1;

use App\Http\Resources\V1\Vehicle\VehicleResource;
use App\Services\V1\VehicleService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controller;

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
}
