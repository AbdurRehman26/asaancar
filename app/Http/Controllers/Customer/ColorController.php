<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Color;
use Illuminate\Http\Request;

class ColorController extends Controller
{
    /**
     * Display a listing of colors.
     */
    public function index(Request $request)
    {
        $colors = Color::active()
            ->orderBy('name')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $colors->map(function ($color) {
                return [
                    'id' => $color->id,
                    'name' => $color->name,
                    'hex_code' => $color->hex_code,
                    'slug' => $color->slug,
                ];
            })
        ]);
    }
}