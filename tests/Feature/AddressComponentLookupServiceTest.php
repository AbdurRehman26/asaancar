<?php

it('redirects guests away from the admin address component lookup page', function () {
    $response = $this->get(route('filament.admin.pages.address-component-lookup'));

    $response->assertRedirect();
});
