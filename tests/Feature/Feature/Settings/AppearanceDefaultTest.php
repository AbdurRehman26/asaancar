<?php

it('uses light mode by default when no appearance cookie is set', function () {
    $response = $this->get('/login');

    $response->assertOk();
    $response->assertDontSee('<html lang="en" class="dark">', false);
    $response->assertSee("const appearance = 'light';", false);
});

it('respects an explicitly selected light theme', function () {
    $response = $this->withCookie('appearance', 'light')->get('/login');

    $response->assertOk();
    $response->assertDontSee('<html lang="en" class="dark">', false);
});
