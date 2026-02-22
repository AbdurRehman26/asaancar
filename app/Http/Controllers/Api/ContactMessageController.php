<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Contact Messages",
 *     description="API Endpoints for contact messages"
 * )
 */
class ContactMessageController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/admin/contact-messages",
     *     operationId="getContactMessages",
     *     tags={"Contact Messages"},
     *     summary="List contact messages",
     *     description="Get a paginated list of contact messages (admin only)",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Parameter(name="per_page", in="query", description="Items per page", required=false, @OA\Schema(type="integer", default=10)),
     *     @OA\Parameter(name="page", in="query", description="Page number", required=false, @OA\Schema(type="integer", default=1)),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="last_page", type="integer"),
     *             @OA\Property(property="per_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);
        $messages = ContactMessage::orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

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

    /**
     * @OA\Post(
     *     path="/api/contact",
     *     operationId="createContactMessage",
     *     tags={"Contact Messages"},
     *     summary="Create contact message",
     *     description="Submit a new contact message",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"name", "contact_info", "message"},
     *
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="contact_info", type="string", example="john@example.com"),
     *             @OA\Property(property="message", type="string", example="I would like to inquire about..."),
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Message created successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Thank you for contacting us!")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_info' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        ContactMessage::create([
            'name' => $validated['name'],
            'contact_info' => $validated['contact_info'],
            'message' => $validated['message'],
        ]);

        return response()->json(['message' => 'Thank you for contacting us!'], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/contact-messages/stats",
     *     operationId="getContactMessageStats",
     *     tags={"Contact Messages"},
     *     summary="Get contact message statistics",
     *     description="Get statistics for contact messages (admin only)",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="total_inquiries", type="integer", example=150),
     *             @OA\Property(property="today_inquiries", type="integer", example=5),
     *             @OA\Property(property="this_week_inquiries", type="integer", example=25),
     *             @OA\Property(property="this_month_inquiries", type="integer", example=100)
     *         )
     *     )
     * )
     * Get contact message statistics for admin dashboard
     */
    public function stats(Request $request)
    {
        $query = ContactMessage::query();
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
