<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CarModel;
use Illuminate\Http\Request;

class CarModelController extends Controller
{
    /**
     * Display a listing of car models.
     */
    public function index(Request $request)
    {
        $query = CarModel::with('carBrand');
        
        // Filter by brand if provided
        if ($request->has('brand_id')) {
            $query->where('car_brand_id', $request->input('brand_id'));
        }
        
        $models = $query->orderBy('name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $models->map(function ($model) {
                return [
                    'id' => $model->id,
                    'name' => $model->name,
                    'slug' => $model->slug,
                    'car_brand_id' => $model->car_brand_id,
                    'brand_name' => $model->carBrand->name ?? null,
                ];
            })
        ]);
    }

    /**
     * Get models by brand ID
     */
    public function getByBrand($brandId)
    {
        $models = CarModel::where('car_brand_id', $brandId)
            ->orderBy('name')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $models->map(function ($model) {
                return [
                    'id' => $model->id,
                    'name' => $model->name,
                    'slug' => $model->slug,
                ];
            })
        ]);
    }
}