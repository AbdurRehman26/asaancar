<?php

namespace App\Http\Controllers\Api;

use App\Models\Area;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    public function index(Request $request)
    {
        $query = Area::where('is_active', true);
        
        // Filter by city_id if provided
        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }
        
        return response()->json([
            'data' => $query->get(['id', 'city_id', 'name', 'slug'])
        ]);
    }
}
