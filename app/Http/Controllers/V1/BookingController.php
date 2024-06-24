<?php

namespace App\Http\Controllers\V1;

use App\Http\Requests\V1\Booking\BookingStoreRequest;
use App\Http\Resources\V1\Booking\BookingResource;
use App\Services\V1\Booking\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;

class BookingController extends Controller
{
    public function __construct(public BookingService $bookingService)
    {
    }

    public function store(BookingStoreRequest $bookingStoreRequest): JsonResponse|BookingResource
    {
        try {
            $booking = $this->bookingService->store(array_merge(
                $bookingStoreRequest->only(
                    'ride_offer_id',
                    'booking_status_id',
                    'from_location',
                    'to_location',
                    'from_date_time',
                    'to_date_time'
                ),
                [
                    'user_id' => auth()->user()->id
                ]
            ));

            return new BookingResource($booking);
        }catch (\Exception $exception){
            return new JsonResponse(
                [
                    'error' => $exception->getMessage(),
                ],
                Response::HTTP_BAD_REQUEST
            );
        }
    }
}
