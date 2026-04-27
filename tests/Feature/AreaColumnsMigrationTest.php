<?php

use Illuminate\Support\Facades\Schema;

it('adds start and end area columns to pick and drop and ride request tables', function () {
    expect(Schema::hasColumns('pick_and_drop_services', [
        'start_area',
        'end_area',
    ]))->toBeTrue();

    expect(Schema::hasColumns('ride_requests', [
        'start_area',
        'end_area',
    ]))->toBeTrue();
});
