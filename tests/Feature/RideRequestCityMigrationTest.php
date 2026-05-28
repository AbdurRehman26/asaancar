<?php

use Illuminate\Support\Facades\Schema;

it('adds city id to ride requests table', function () {
    expect(Schema::hasColumn('ride_requests', 'city_id'))->toBeTrue();
});
