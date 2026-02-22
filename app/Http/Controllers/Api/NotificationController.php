<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Schema(
 *     schema="Notification",
 *     title="Notification",
 *     description="Notification model",
 *
 *     @OA\Property(property="id", type="string", format="uuid", example="550e8400-e29b-41d4-a716-446655440000"),
 *     @OA\Property(property="type", type="string", example="App\\Notifications\\MessageReceivedNotification"),
 *     @OA\Property(property="data", type="object", example={"type": "booking_created", "booking_id": 1, "message": "New booking received"}),
 *     @OA\Property(property="read_at", type="string", format="date-time", nullable=true, example="2024-01-01T12:00:00Z"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T12:00:00Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-01T12:00:00Z")
 * )
 */
class NotificationController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/notifications",
     *     operationId="getNotifications",
     *     tags={"Notifications"},
     *     summary="Get user notifications",
     *     description="Retrieve paginated list of notifications for the authenticated user",
     *     security={{"sanctum":{}}},
     *
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Number of notifications per page",
     *         required=false,
     *
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         required=false,
     *
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *
     *     @OA\Parameter(
     *         name="unread_only",
     *         in="query",
     *         description="Filter to show only unread notifications",
     *         required=false,
     *
     *         @OA\Schema(type="boolean", default=false)
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Notification")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="from", type="integer", nullable=true),
     *             @OA\Property(property="last_page", type="integer"),
     *             @OA\Property(property="per_page", type="integer"),
     *             @OA\Property(property="to", type="integer", nullable=true),
     *             @OA\Property(property="total", type="integer"),
     *             @OA\Property(property="meta", type="object",
     *                 @OA\Property(property="current_page", type="integer"),
     *                 @OA\Property(property="last_page", type="integer"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="total", type="integer"),
     *                 @OA\Property(property="from", type="integer", nullable=true),
     *                 @OA\Property(property="to", type="integer", nullable=true)
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $perPage = $request->input('per_page', 15);
        $unreadOnly = $request->boolean('unread_only', false);

        $query = $user->notifications();

        if ($unreadOnly) {
            $query->whereNull('read_at');
        }

        $notifications = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => NotificationResource::collection($notifications->items()),
            'current_page' => $notifications->currentPage(),
            'from' => $notifications->firstItem(),
            'last_page' => $notifications->lastPage(),
            'per_page' => $notifications->perPage(),
            'to' => $notifications->lastItem(),
            'total' => $notifications->total(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'from' => $notifications->firstItem(),
                'to' => $notifications->lastItem(),
            ],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/notifications/unread-count",
     *     operationId="getUnreadNotificationCount",
     *     tags={"Notifications"},
     *     summary="Get unread notification count",
     *     description="Get the count of unread notifications for the authenticated user",
     *     security={{"sanctum":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="unread_count", type="integer", example=5)
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function unreadCount(): JsonResponse
    {
        $user = Auth::user();
        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/notifications/{id}/read",
     *     operationId="markNotificationAsRead",
     *     tags={"Notifications"},
     *     summary="Mark notification as read",
     *     description="Mark a specific notification as read",
     *     security={{"sanctum":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Notification ID (UUID)",
     *         required=true,
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Notification marked as read",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Notification marked as read"),
     *             @OA\Property(property="notification", ref="#/components/schemas/Notification")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Notification not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function markAsRead(string $id): JsonResponse
    {
        $user = Auth::user();
        $notification = $user->notifications()->where('id', $id)->first();

        if (! $notification) {
            return response()->json([
                'message' => 'Notification not found',
            ], 404);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => new NotificationResource($notification),
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/notifications/read-all",
     *     operationId="markAllNotificationsAsRead",
     *     tags={"Notifications"},
     *     summary="Mark all notifications as read",
     *     description="Mark all unread notifications as read for the authenticated user",
     *     security={{"sanctum":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="All notifications marked as read",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="All notifications marked as read"),
     *             @OA\Property(property="marked_count", type="integer", example=10)
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = Auth::user();
        $markedCount = $user->unreadNotifications()->update(['read_at' => now()]);

        return response()->json([
            'message' => 'All notifications marked as read',
            'marked_count' => $markedCount,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/notifications/{id}",
     *     operationId="deleteNotification",
     *     tags={"Notifications"},
     *     summary="Delete notification",
     *     description="Delete a specific notification",
     *     security={{"sanctum":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Notification ID (UUID)",
     *         required=true,
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Notification deleted",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Notification deleted successfully")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Notification not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();
        $notification = $user->notifications()->where('id', $id)->first();

        if (! $notification) {
            return response()->json([
                'message' => 'Notification not found',
            ], 404);
        }

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully',
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/notifications",
     *     operationId="deleteAllNotifications",
     *     tags={"Notifications"},
     *     summary="Delete all notifications",
     *     description="Delete all notifications for the authenticated user",
     *     security={{"sanctum":{}}},
     *
     *     @OA\Parameter(
     *         name="read_only",
     *         in="query",
     *         description="Delete only read notifications",
     *         required=false,
     *
     *         @OA\Schema(type="boolean", default=false)
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Notifications deleted",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Notifications deleted successfully"),
     *             @OA\Property(property="deleted_count", type="integer", example=10)
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function deleteAll(Request $request): JsonResponse
    {
        $user = Auth::user();
        $readOnly = $request->boolean('read_only', false);

        if ($readOnly) {
            $deletedCount = $user->notifications()->whereNotNull('read_at')->delete();
        } else {
            $deletedCount = $user->notifications()->delete();
        }

        return response()->json([
            'message' => 'Notifications deleted successfully',
            'deleted_count' => $deletedCount,
        ]);
    }
}
