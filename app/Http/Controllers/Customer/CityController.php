<?php

namespace App\Http\Controllers\Customer;

use App\Models\City;
use App\Http\Controllers\Controller;
use App\Http\Resources\CityResource;

class CityController extends Controller
{
    public function index()
    {
        return CityResource::collection(City::all());
    }
} 