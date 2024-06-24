<?php

namespace App\Services\V1\RideOffer;

use App\Models\City;
use App\Models\RideOffer;
use App\Models\RideOfferDetail;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\QueryBuilder;

class RideOfferService
{
    private RideOffer $rideOffer;

    public function store(array $data): RideOffer
    {
        $this->rideOffer = new RideOffer();
        $this->storeBasicDetails($data);
        $this->rideOffer->rideOfferDetails()->save($this->storeExtraDetails(new RideOfferDetail(), $data));

        return $this->rideOffer;
    }

    public function update(RideOffer $rideOffer, array $data): RideOffer
    {
        $this->rideOffer = $rideOffer;
        $this->storeBasicDetails($data);
        $this->rideOffer->rideOfferDetails()->save($this->storeExtraDetails(RideOfferDetail::where('ride_offer_id', $this->rideOffer->id)->first(), $data));

        return $this->rideOffer->refresh();
    }

    protected function storeBasicDetails(array $data): void
    {
        $this->rideOffer->vehicle_id = $data['vehicle_id'];
        $this->rideOffer->user_id = $data['user_id'];
        $this->rideOffer->city_id = $data['city_id'] ?? City::forKarachi()->first()->id;
        $this->rideOffer->save();
    }

    private function storeExtraDetails(RideOfferDetail $rideOfferDetails, array $data): RideOfferDetail
    {
        $rideOfferDetails->duration_for = $data['duration_for'];
        $rideOfferDetails->with_driver = $data['with_driver'] ?? false;
        $rideOfferDetails->price = $data['price'];
        return $rideOfferDetails;
    }

    public function getRideOffers(): LengthAwarePaginator
    {
        return QueryBuilder::for(RideOffer::class)
            ->allowedFilters(RideOffer::getAllowedFilters())
            ->paginate();
    }
}
