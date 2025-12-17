<?php

namespace App\Http\Controllers\Customer;

/**
 * @OA\Tag(
 *     name="Cars",
 *     description="API Endpoints for car management"
 * )
 */

use App\Http\Controllers\Controller;
use App\Http\Resources\CarResource;
use App\Services\CarService;
use App\Services\S3Service;
use App\Models\Car;
use App\Models\CarOffer;
use App\Http\Requests\Car\CreateCarRequest;
use App\Http\Requests\Car\UpdateCarRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Cars",
 *     description="API Endpoints for car management"
 * )
 */
class CarController extends Controller
{
    protected $carService;
    protected $s3Service;

    public function __construct(CarService $carService, S3Service $s3Service)
    {
        $this->carService = $carService;
        $this->s3Service = $s3Service;
    }

    /**
     * @OA\Get(
     *     path="/api/customer/cars",
     *     operationId="getCarsList",
     *     tags={"Cars"},
     *     summary="Get list of cars",
     *     description="Returns list of cars with pagination (response format similar to Pick & Drop API)",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Car")),
     *             @OA\Property(
     *                 property="meta",
     *                 type="object",
     *                 @OA\Property(property="current_page", type="integer"),
     *                 @OA\Property(property="last_page", type="integer"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="total", type="integer"),
     *                 @OA\Property(property="from", type="integer", nullable=true),
     *                 @OA\Property(property="to", type="integer", nullable=true),
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 9);
        $filters = $request->only([
            'brand_id', 'type_id', 'store_id', 'transmission',
            'fuel_type', 'min_seats', 'max_price'
        ]);

        $user = $request->user();

        $paginated = $this->carService->getPaginatedCarsForListing($perPage, $filters, $user);

        // Shape response similar to Pick & Drop API: data + meta, while keeping
        // top-level pagination keys for backward compatibility with existing frontend.
        return response()->json([
            'data' => $paginated['data'] ?? [],
            'meta' => $paginated['meta'] ?? [
                'current_page' => $paginated['current_page'] ?? 1,
                'last_page' => $paginated['last_page'] ?? 1,
                'per_page' => $paginated['per_page'] ?? $perPage,
                'total' => $paginated['total'] ?? 0,
                'from' => $paginated['from'] ?? null,
                'to' => $paginated['to'] ?? null,
            ],
            'current_page' => $paginated['current_page'] ?? 1,
            'last_page' => $paginated['last_page'] ?? 1,
            'per_page' => $paginated['per_page'] ?? $perPage,
            'total' => $paginated['total'] ?? 0,
            'from' => $paginated['from'] ?? null,
            'to' => $paginated['to'] ?? null,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/customer/cars",
     *     operationId="storeCar",
     *     tags={"Cars"},
     *     summary="Store a new car",
     *     description="Creates a new car record",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CarRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Car created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Car")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function store(CreateCarRequest $request)
    {
        $validated = $request->validated();

        // Handle model creation if model name is provided
        if ($request->has('model') && $request->input('model') && $request->has('car_brand_id')) {
            $modelName = $request->input('model');
            $brandId = $request->input('car_brand_id');

            // Check if model exists for this brand
            $existingModel = \App\Models\CarModel::where('car_brand_id', $brandId)
                ->where('name', $modelName)
                ->first();

            if (!$existingModel) {
                // Create new model
                $newModel = \App\Models\CarModel::create([
                    'car_brand_id' => $brandId,
                    'name' => $modelName,
                    'slug' => \Illuminate\Support\Str::slug($modelName),
                ]);
                $validated['car_model_id'] = $newModel->id;
            } else {
                $validated['car_model_id'] = $existingModel->id;
            }
        }

        // Handle image URLs (images are now uploaded separately via ImageUpload API)
        if ($request->has('image_urls') && is_array($request->input('image_urls'))) {
            $validated['image_urls'] = $request->input('image_urls');
        }

        $car = Car::create($validated);

        if($validated['with_driver_rate'] || $validated['without_driver_rate']) {
            CarOffer::query()->create([
                'car_id' => $car->id,
                'price_with_driver' => $validated['with_driver_rate'],
                'price_without_driver' => $validated['without_driver_rate'],
            ]);
        }

        // Handle tag relationships
        if ($request->has('tag_ids') && is_array($request->input('tag_ids'))) {
            $car->tags()->sync($request->input('tag_ids'));
        }

        return new CarResource($car->load(['carBrand', 'carModel', 'carType', 'store', 'tags']));
    }

    /**
     * @OA\Get(
     *     path="/api/customer/cars/{id}",
     *     operationId="getCarById",
     *     tags={"Cars"},
     *     summary="Get car information",
     *     description="Returns car data by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Car ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/Car")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Car not found"
     *     )
     * )
     */
    public function show($id)
    {
        $car = $this->carService->getCarForListing((int) $id);
        if (!$car) {
            return response()->json(['message' => 'Car not found'], 404);
        }
        return response()->json(['data' => $car]);
    }

    /**
     * Get car data for editing (with raw IDs and relationships)
     */
    public function showForEdit($id)
    {
        $car = Car::with(['carBrand', 'carModel', 'carType', 'store'])->find((int) $id);
        if (!$car) {
            return response()->json(['message' => 'Car not found'], 404);
        }
        return new CarResource($car);
    }

    /**
     * @OA\Get(
     *     path="/api/cars/{id}/with-offer-form",
     *     operationId="getCarWithOfferForm",
     *     tags={"Cars"},
     *     summary="Get car information with offer form data",
     *     description="Returns car data by ID with additional data needed for offer form",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Car ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Car"),
     *             @OA\Property(property="offer_form_data", type="object",
     *                 @OA\Property(property="currencies", type="array", @OA\Items(type="string")),
     *                 @OA\Property(property="existing_offers", type="array", @OA\Items(ref="#/components/schemas/CarOffer"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Car not found"
     *     )
     * )
     */
    public function showWithOfferForm($id)
    {
        $car = $this->carService->getCarForListing((int) $id);
        if (!$car) {
            return response()->json(['message' => 'Car not found'], 404);
        }

        // Get existing offers for this car
        $existingOffers = CarOffer::where('car_id', $id)
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        // Available currencies
        $currencies = ['PKR', 'USD', 'EUR', 'GBP'];

        return response()->json([
            'data' => $car,
            'offer_form_data' => [
                'currencies' => $currencies,
                'existing_offers' => $existingOffers
            ]
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/customer/cars/{id}",
     *     operationId="updateCar",
     *     tags={"Cars"},
     *     summary="Update car information",
     *     description="Updates car data by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Car ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CarRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Car updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Car")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Car not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function update(UpdateCarRequest $request, string $id)
    {
        $car = Car::findOrFail($id);

        $validated = $request->validated();

        // Handle model creation if model name is provided
        if ($request->has('model') && $request->input('model') && $request->has('car_brand_id')) {
            $modelName = $request->input('model');
            $brandId = $request->input('car_brand_id');

            // Check if model exists for this brand
            $existingModel = \App\Models\CarModel::where('car_brand_id', $brandId)
                ->where('name', $modelName)
                ->first();

            if (!$existingModel) {
                // Create new model
                $newModel = \App\Models\CarModel::create([
                    'car_brand_id' => $brandId,
                    'name' => $modelName,
                    'slug' => \Illuminate\Support\Str::slug($modelName),
                ]);
                $validated['car_model_id'] = $newModel->id;
            } else {
                $validated['car_model_id'] = $existingModel->id;
            }
        }

        // Handle image URLs (images are now uploaded separately via ImageUpload API)
        if ($request->has('image_urls') && is_array($request->input('image_urls'))) {
            $validated['image_urls'] = $request->input('image_urls');
        }

        $car->update($validated);

        // Handle tag relationships
        if ($request->has('tag_ids') && is_array($request->input('tag_ids'))) {
            $car->tags()->sync($request->input('tag_ids'));
        }

        // Handle pricing fields - create or update CarOffer
        if ($request->has('without_driver_rate') || $request->has('with_driver_rate')) {
            $withoutDriver = $request->input('without_driver_rate');
            $withDriver = $request->input('with_driver_rate');

            // Find existing active offer or create new one
            $carOffer = CarOffer::where('car_id', $car->id)
                ->where('is_active', true)
                ->first();

            if (!$carOffer) {
                $carOffer = new CarOffer();
                $carOffer->car_id = $car->id;
                $carOffer->is_active = true;
                $carOffer->available_from = now();
                $carOffer->available_to = now()->addYear(); // Set to expire in 1 year
            }

            if ($withoutDriver !== null) {
                $carOffer->price_without_driver = $withoutDriver;
            }
            if ($withDriver !== null) {
                $carOffer->price_with_driver = $withDriver;
            }

            $carOffer->save();
        }

        return new CarResource($car->load(['carBrand', 'carModel', 'carType', 'store', 'tags']));
    }

    public function search(Request $request)
    {
        $filters = $request->only([
            'brand_id', 'type_id', 'store_id', 'transmission',
            'fuel_type', 'min_seats', 'max_price', 'tag_ids'
        ]);

        $cars = $this->carService->searchCars($filters);

        return response()->json([
            'success' => true,
            'data' => $cars
        ]);
    }

    /**
     * Search tags by name or type
     */
    public function searchTags(Request $request)
    {
        $query = $request->input('q', '');
        $type = $request->input('type');

        $tagsQuery = \App\Models\Tag::query();

        if ($query) {
            $tagsQuery->where('name', 'like', "%{$query}%");
        }

        if ($type) {
            $tagsQuery->where('type', $type);
        }

        $tags = $tagsQuery->select('id', 'name', 'type', 'color')
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tags
        ]);
    }

    public function getFilters()
    {
        $brands = $this->carService->getCarBrands();
        $types = $this->carService->getCarTypes();
        $stores = $this->carService->getStores();
        $tags = \App\Models\Tag::select('id', 'name', 'type', 'color')->get();
        $models = \App\Models\CarModel::with('carBrand')->select('id', 'name', 'slug', 'car_brand_id')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'brands' => $brands,
                'types' => $types,
                'stores' => $stores,
                'tags' => $tags,
                'models' => $models,
            ]
        ]);
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        // Get all store IDs for this user
        $storeIds = $user->stores()->pluck('stores.id');
        $count = \App\Models\Car::whereIn('store_id', $storeIds)->count();
        return response()->json(['count' => $count]);
    }

    /**
     * @OA\Delete(
     *     path="/api/customer/cars/{id}",
     *     operationId="deleteCar",
     *     tags={"Cars"},
     *     summary="Delete car",
     *     description="Deletes car by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Car ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Car deleted successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="Car deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Car not found"
     *     )
     * )
     */
    public function destroy(string $id)
    {
        $car = Car::findOrFail($id);

        // Delete images from S3 if they exist
        if ($car->image_urls && is_array($car->image_urls)) {
            $this->s3Service->deleteMultipleFiles($car->image_urls);
        }

        $car->delete();

        return response()->json(['message' => 'Car deleted successfully']);
    }

    /**
     * @OA\Get(
     *     path="/api/my-cars",
     *     operationId="getMyCars",
     *     tags={"Cars"},
     *     summary="Get my cars only",
     *     description="Returns cars belonging to authenticated user's stores only",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         required=false,
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Car")),
     *             @OA\Property(
     *                 property="meta",
     *                 type="object",
     *                 @OA\Property(property="current_page", type="integer"),
     *                 @OA\Property(property="last_page", type="integer"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="total", type="integer"),
     *                 @OA\Property(property="from", type="integer", nullable=true),
     *                 @OA\Property(property="to", type="integer", nullable=true),
     *             )
     *         )
     *     )
     * )
     */
    public function myCars(Request $request)
    {
        $user = $request->user();
        $perPage = $request->input('per_page', 15);

        // Get all store IDs for this user
        $storeIds = $user->stores()->pluck('stores.id');

        if ($storeIds->isEmpty()) {
            return response()->json([
                'data' => [],
                'meta' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $perPage,
                    'total' => 0,
                    'from' => null,
                    'to' => null,
                ],
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $perPage,
                'total' => 0,
                'from' => null,
                'to' => null,
            ]);
        }

        $cars = Car::with(['carBrand', 'carModel', 'carType', 'store', 'carOffers' => function($query) {
            $query->where('is_active', true)
                  ->where(function($q) {
                      $q->where(function($subQ) {
                          $subQ->whereNotNull('start_date')
                               ->whereNotNull('end_date')
                               ->where('start_date', '<=', now())
                               ->where('end_date', '>=', now());
                      })->orWhere(function($subQ) {
                          $subQ->whereNull('start_date')
                               ->whereNull('end_date');
                      });
                  });
        }])
        ->whereIn('store_id', $storeIds)
        ->orderBy('created_at', 'desc')
        ->paginate($perPage);

        // Shape response similar to Pick & Drop API: data + meta
        return response()->json([
            'data' => CarResource::collection($cars->items()),
            'meta' => [
                'current_page' => $cars->currentPage(),
                'last_page' => $cars->lastPage(),
                'per_page' => $cars->perPage(),
                'total' => $cars->total(),
                'from' => $cars->firstItem(),
                'to' => $cars->lastItem(),
            ],
            'current_page' => $cars->currentPage(),
            'last_page' => $cars->lastPage(),
            'per_page' => $cars->perPage(),
            'total' => $cars->total(),
            'from' => $cars->firstItem(),
            'to' => $cars->lastItem(),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/all-cars",
     *     operationId="getAllCars",
     *     tags={"Cars"},
     *     summary="Get cars from all stores",
     *     description="Returns cars from all stores (public endpoint)",
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         required=false,
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *     @OA\Parameter(
     *         name="store_id",
     *         in="query",
     *         description="Filter by store ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Car")),
     *             @OA\Property(
     *                 property="meta",
     *                 type="object",
     *                 @OA\Property(property="current_page", type="integer"),
     *                 @OA\Property(property="last_page", type="integer"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="total", type="integer"),
     *                 @OA\Property(property="from", type="integer", nullable=true),
     *                 @OA\Property(property="to", type="integer", nullable=true),
     *             )
     *         )
     *     )
     * )
     */
    public function allCars(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $storeId = $request->input('store_id');

        $query = Car::with(['carBrand', 'carModel', 'carType', 'store', 'carOffers' => function($query) {
            $query->where('is_active', true)
                  ->where(function($q) {
                      $q->where(function($subQ) {
                          $subQ->whereNotNull('start_date')
                               ->whereNotNull('end_date')
                               ->where('start_date', '<=', now())
                               ->where('end_date', '>=', now());
                      })->orWhere(function($subQ) {
                          $subQ->whereNull('start_date')
                               ->whereNull('end_date');
                      });
                  });
        }])
        ->whereHas('store');

        if ($storeId) {
            $query->where('store_id', $storeId);
        }

        $cars = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Shape response similar to Pick & Drop API: data + meta
        return response()->json([
            'data' => CarResource::collection($cars->items()),
            'meta' => [
                'current_page' => $cars->currentPage(),
                'last_page' => $cars->lastPage(),
                'per_page' => $cars->perPage(),
                'total' => $cars->total(),
                'from' => $cars->firstItem(),
                'to' => $cars->lastItem(),
            ],
            'current_page' => $cars->currentPage(),
            'last_page' => $cars->lastPage(),
            'per_page' => $cars->perPage(),
            'total' => $cars->total(),
            'from' => $cars->firstItem(),
            'to' => $cars->lastItem(),
        ]);
    }
}
