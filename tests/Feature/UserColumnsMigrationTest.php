<?php

use Illuminate\Support\Facades\Schema;

it('adds gender and city_id columns to users table', function () {
    expect(Schema::hasColumns('users', [
        'gender',
        'city_id',
    ]))->toBeTrue();
});
