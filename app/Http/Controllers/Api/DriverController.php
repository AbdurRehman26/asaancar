<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DriverListingResource;
use App\Models\User;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    private const APP_CITY_ID = 197;

    /**
     * @OA\Get(
     *     path="/api/drivers",
     *     operationId="getDriversListing",
     *     tags={"Users"},
     *     summary="List drivers with active rides",
     *     description="Returns users who currently have at least one active pick and drop service.",
     *
     *     @OA\Parameter(name="per_page", in="query", description="Items per page", required=false, @OA\Schema(type="integer", default=12)),
     *     @OA\Parameter(name="gender", in="query", description="Filter by driver gender", required=false, @OA\Schema(type="string", enum={"male", "female"})),
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
            ->where('city_id', self::APP_CITY_ID)
            ->whereHas('pickAndDropServices', function ($query): void {
                $this->applyActiveAppCityRideConstraint($query);
            })
            ->when($request->filled('gender'), function ($query) use ($request): void {
                $gender = $request->string('gender')->toString();

                $query->where(function ($genderQuery) use ($gender): void {
                    $genderQuery->where('gender', $gender)
                        ->orWhere(function ($fallbackQuery) use ($gender): void {
                            $fallbackQuery->whereNull('gender')
                                ->whereHas('pickAndDropServices', function ($serviceQuery) use ($gender): void {
                                    $this->applyActiveAppCityRideConstraint($serviceQuery);

                                    $serviceQuery
                                        ->where('driver_gender', $gender);
                                });
                        });
                });
            })
            ->withCount([
                'pickAndDropServices as active_pick_and_drop_services_count' => function ($query): void {
                    $this->applyActiveAppCityRideConstraint($query);
                },
            ])
            ->with([
                'city',
                'pickAndDropServices' => function ($query): void {
                    $this->applyActiveAppCityRideConstraint($query);

                    $query->with(['pickupArea', 'dropoffArea'])
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
            ->where('city_id', self::APP_CITY_ID)
            ->whereHas('pickAndDropServices', function ($query): void {
                $this->applyActiveAppCityRideConstraint($query);
            })
            ->withCount([
                'pickAndDropServices as active_pick_and_drop_services_count' => function ($query): void {
                    $this->applyActiveAppCityRideConstraint($query);
                },
            ])
            ->with([
                'city',
                'pickAndDropServices' => function ($query): void {
                    $this->applyActiveAppCityRideConstraint($query);

                    $query->with(['pickupArea', 'dropoffArea'])
                        ->latest('departure_time')
                        ->limit(1);
                },
            ])
            ->firstOrFail();

        $driver->setRelation('latestActivePickAndDrop', $driver->pickAndDropServices->first());
        $driver->unsetRelation('pickAndDropServices');

        return new DriverListingResource($driver);
    }

    private function applyActiveAppCityRideConstraint($query): void
    {
        $query
            ->where('is_active', true)
            ->where('pickup_city_id', self::APP_CITY_ID)
            ->where(function ($cityQuery): void {
                $cityQuery
                    ->whereNull('dropoff_city_id')
                    ->orWhere('dropoff_city_id', self::APP_CITY_ID);
            });
    }
}
