<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\ContactMessage;
use App\Models\Store;

class ContactMessageController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);
        $storeId = $request->get('store_id');
        
        // Build query with store filter
        $query = ContactMessage::with('store')->orderBy('created_at', 'desc');
        
        if ($storeId) {
            $query->where('store_id', $storeId);
        }
        
        // Get contact messages with store information and pagination
        $messages = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $messages->items(),
            'current_page' => $messages->currentPage(),
            'last_page' => $messages->lastPage(),
            'per_page' => $messages->perPage(),
            'total' => $messages->total(),
            'from' => $messages->firstItem(),
            'to' => $messages->lastItem(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_info' => 'required|string|max:255',
            'message' => 'required|string',
            'store_id' => 'nullable|integer|exists:stores,id',
            'car_details' => 'nullable|array',
        ]);

        $contact = ContactMessage::create([
            'name' => $validated['name'],
            'contact_info' => $validated['contact_info'],
            'message' => $validated['message'],
            'store_id' => $validated['store_id'] ?? null,
            'car_details' => $validated['car_details'] ?? null,
        ]);

        return response()->json(['message' => 'Thank you for contacting us!'], 201);
    }

    /**
     * Get contact message statistics for admin dashboard
     */
    public function stats(Request $request)
    {
        $storeId = $request->get('store_id');
        
        $query = ContactMessage::query();
        
        if ($storeId) {
            $query->where('store_id', $storeId);
        }
        
        $totalInquiries = $query->count();
        $todayInquiries = $query->clone()->whereDate('created_at', today())->count();
        $thisWeekInquiries = $query->clone()->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();
        $thisMonthInquiries = $query->clone()->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count();
        
        return response()->json([
            'total_inquiries' => $totalInquiries,
            'today_inquiries' => $todayInquiries,
            'this_week_inquiries' => $thisWeekInquiries,
            'this_month_inquiries' => $thisMonthInquiries,
        ]);
    }
}
