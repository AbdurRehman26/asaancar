<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DriverListingResource;
use App\Models\User;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/drivers",
     *     operationId="getDriversListing",
     *     tags={"Users"},
     *     summary="List drivers with active rides",
     *     description="Returns users who currently have at least one active pick and drop service.",
     *
     *     @OA\Parameter(name="per_page", in="query", description="Items per page", required=false, @OA\Schema(type="integer", default=12)),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *
     *                 @OA\Items(ref="#/components/schemas/DriverListing")
     *             ),
     *
     *             @OA\Property(property="links", type="object"),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $drivers = User::query()
            ->whereHas('pickAndDropServices', function ($query) {
                $query->where('is_active', true);
            })
            ->withCount([
                'pickAndDropServices as active_pick_and_drop_services_count' => function ($query) {
                    $query->where('is_active', true);
                },
            ])
            ->with([
                'pickAndDropServices' => function ($query) {
                    $query->where('is_active', true)
                        ->latest('departure_time')
                        ->limit(1);
                },
            ])
            ->latest()
            ->paginate((int) $request->input('per_page', 12));

        $drivers->getCollection()->transform(function (User $user) {
            $user->setRelation('latestActivePickAndDrop', $user->pickAndDropServices->first());
            $user->unsetRelation('pickAndDropServices');

            return $user;
        });

        return DriverListingResource::collection($drivers);
    }

    /**
     * @OA\Get(
     *     path="/api/drivers/{id}",
     *     operationId="getDriverProfile",
     *     tags={"Users"},
     *     summary="Get a driver profile",
     *     description="Returns a driver who currently has at least one active pick and drop service.",
     *
     *     @OA\Parameter(name="id", in="path", description="Driver user ID", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", ref="#/components/schemas/DriverListing")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Driver not found")
     * )
     */
    public function show(Request $request, int $id)
    {
        $driver = User::query()
            ->whereKey($id)
            ->whereHas('pickAndDropServices', function ($query) {
                $query->where('is_active', true);
            })
            ->withCount([
                'pickAndDropServices as active_pick_and_drop_services_count' => function ($query) {
                    $query->where('is_active', true);
                },
            ])
            ->with([
                'pickAndDropServices' => function ($query) {
                    $query->where('is_active', true)
                        ->latest('departure_time')
                        ->limit(1);
                },
            ])
            ->firstOrFail();

        $driver->setRelation('latestActivePickAndDrop', $driver->pickAndDropServices->first());
        $driver->unsetRelation('pickAndDropServices');

        return new DriverListingResource($driver);
    }
}
