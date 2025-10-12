<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\ContactMessage;

class ContactMessageController extends Controller
{
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
}
