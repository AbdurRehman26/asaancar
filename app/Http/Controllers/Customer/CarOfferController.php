<?php

namespace App\Http\Controllers\Customer;

use App\Models\CarOffer;
use App\Models\Car;
use App\Http\Requests\Offer\CreateCarOfferRequest;
use App\Http\Requests\Offer\UpdateCarOfferRequest;
use App\Http\Controllers\Controller;
use App\Http\Resources\CarOfferResource;

/**
 * @OA\Tag(
 *     name="Car Offers",
 *     description="API Endpoints for car offer management"
 * )
 */
class CarOfferController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/customer/car-offers",
     *     operationId="getCarOffersList",
     *     tags={"Car Offers"},
     *     summary="Get list of car offers",
     *     description="Returns list of car offers with pagination",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/CarOffer")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="per_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     )
     * )
     */
    public function index()
    {
        $offers = CarOffer::with(['car'])->paginate(10);
        return CarOfferResource::collection($offers);
    }

    /**
     * @OA\Post(
     *     path="/api/customer/car-offers",
     *     operationId="storeCarOffer",
     *     tags={"Car Offers"},
     *     summary="Store a new car offer",
     *     description="Creates a new car offer record",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CarOfferRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Car offer created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/CarOffer")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function store(CreateCarOfferRequest $request)
    {
        $validated = $request->validated();
        $offer = CarOffer::create($validated);
        return new CarOfferResource($offer->load(['car']));
    }

    /**
     * @OA\Get(
     *     path="/api/customer/car-offers/{id}",
     *     operationId="getCarOfferById",
     *     tags={"Car Offers"},
     *     summary="Get car offer information",
     *     description="Returns car offer data by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Car offer ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/CarOffer")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Car offer not found"
     *     )
     * )
     */
    public function show(string $id)
    {
        $offer = CarOffer::with(['car'])->findOrFail($id);
        return new CarOfferResource($offer);
    }

    /**
     * @OA\Put(
     *     path="/api/customer/car-offers/{id}",
     *     operationId="updateCarOffer",
     *     tags={"Car Offers"},
     *     summary="Update car offer information",
     *     description="Updates car offer data by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Car offer ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CarOfferRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Car offer updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/CarOffer")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Car offer not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function update(UpdateCarOfferRequest $request, string $id)
    {
        $offer = CarOffer::findOrFail($id);
        $validated = $request->validated();
        $offer->update($validated);
        return new CarOfferResource($offer->load(['car']));
    }

    /**
     * @OA\Delete(
     *     path="/api/customer/car-offers/{id}",
     *     operationId="deleteCarOffer",
     *     tags={"Car Offers"},
     *     summary="Delete car offer",
     *     description="Deletes car offer by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Car offer ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Car offer deleted successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="Car offer deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Car offer not found"
     *     )
     * )
     */
    public function destroy(string $id)
    {
        $offer = CarOffer::findOrFail($id);
        $offer->delete();
        
        return response()->json(['message' => 'Car offer deleted successfully']);
    }
}
