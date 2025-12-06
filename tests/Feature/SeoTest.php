<?php

use App\Models\PickAndDrop;
use App\Models\User;

it('injects seo meta tags for facebook bot on pick and drop listing', function () {
    $response = $this->withHeaders([
        'User-Agent' => 'facebookexternalhit/1.1',
    ])->get('/pick-and-drop');

    $response->assertStatus(200);
    
    // Check for the new title
    $response->assertSee('<title>Pick &amp; Drop Services - Find Rides with Multiple Stops | Asaancar</title>', false);
    
    // Check for OG tags
    $response->assertSee('<meta property="og:title" content="Pick &amp; Drop Services - Find Rides with Multiple Stops | Asaancar">', false);
    $response->assertSee('<meta property="og:description"', false);
    
    // Check that the inertia title is NOT present (it should have been replaced)
    $response->assertDontSee('<title inertia>', false);
});

it('does not inject seo meta tags for normal user', function () {
    $response = $this->get('/pick-and-drop');

    $response->assertStatus(200);
    
    // Normal user should see the inertia title
    $response->assertSee('<title inertia>', false);
    
    // Normal user should NOT see the injected OG tags
    $response->assertDontSee('<meta property="og:title"', false);
});
