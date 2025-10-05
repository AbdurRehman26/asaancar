<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Year;
use Illuminate\Http\Request;

class YearController extends Controller
{
    /**
     * Display a listing of years.
     */
    public function index(Request $request)
    {
        $years = Year::active()
            ->ordered()
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $years->map(function ($year) {
                return [
                    'id' => $year->id,
                    'year' => $year->year,
                ];
            })
        ]);
    }
}