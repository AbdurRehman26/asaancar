<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;
use App\Models\PickAndDrop;

class InjectSEOMetaTags
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // Only inject meta tags for bots/crawlers
        if (!$this->isBot($request)) {
            return $response;
        }

        // Only process HTML responses
        $contentType = $response->headers->get('Content-Type', '');
        if (!str_contains($contentType, 'text/html') && !str_contains($contentType, 'text/plain')) {
            return $response;
        }

        // Get content and check if it's valid HTML
        $content = $response->getContent();
        if (empty($content) || !is_string($content)) {
            return $response;
        }
        
        // Check if content looks like HTML
        if (stripos($content, '<html') === false && stripos($content, '<!DOCTYPE') === false) {
            return $response;
        }
        
        // Handle pick-and-drop detail pages
        if (preg_match('#^pick-and-drop/(\d+)$#', $request->path(), $matches)) {
            $serviceId = (int) $matches[1];
            $metaTags = $this->getPickAndDropMetaTags($serviceId, $request);
            
            if ($metaTags) {
                $content = $this->injectMetaTags($content, $metaTags);
                $response->setContent($content);
            }
        }
        // Handle pick-and-drop listing page
        elseif (in_array($request->path(), ['pick-and-drop', 'pick-and-drop/'], true)) {
            $metaTags = $this->getPickAndDropListingMetaTags($request);
            $content = $this->injectMetaTags($content, $metaTags);
            $response->setContent($content);
        }

        return $response;
    }

    /**
     * Check if the request is from a bot/crawler
     */
    private function isBot(Request $request): bool
    {
        $userAgent = $request->userAgent() ?? '';
        
        $botPatterns = [
            'facebookexternalhit',
            'Facebot',
            'Twitterbot',
            'LinkedInBot',
            'WhatsApp',
            'Googlebot',
            'bingbot',
            'Slackbot',
            'SkypeUriPreview',
            'Applebot',
        ];

        foreach ($botPatterns as $pattern) {
            if (stripos($userAgent, $pattern) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get meta tags for pick-and-drop detail page
     */
    private function getPickAndDropMetaTags(int $serviceId, Request $request): ?array
    {
        $service = PickAndDrop::with(['user', 'stops'])
            ->where('id', $serviceId)
            ->where('is_active', true)
            ->first();

        if (!$service) {
            return null;
        }

        $baseUrl = $request->getScheme() . '://' . $request->getHttpHost();
        $pageUrl = $baseUrl . $request->getPathInfo();
        // Use feature image (image.png) if available, otherwise fallback to logo or icon
        $imageUrl = $baseUrl . (file_exists(public_path('image.png')) ? '/image.png' : (file_exists(public_path('logo.svg')) ? '/logo.svg' : '/icon.png'));

        // Create a more compelling title for Facebook preview
        $title = sprintf(
            '%s → %s | Pick & Drop Service - Asaancar',
            $service->start_location,
            $service->end_location
        );

        // Create a more detailed and formatted description for better Facebook preview
        $descriptionParts = [];
        $descriptionParts[] = sprintf(
            '🚗 %s Driver Available',
            ucfirst($service->driver_gender)
        );
        $descriptionParts[] = sprintf(
            '📍 Route: %s → %s',
            $service->start_location,
            $service->end_location
        );
        $descriptionParts[] = sprintf(
            '⏰ %s at %s',
            $service->is_everyday ? 'Everyday' : 'Scheduled',
            $service->departure_time
        );
        $descriptionParts[] = sprintf(
            '👥 %d Space%s Available',
            $service->available_spaces,
            $service->available_spaces !== 1 ? 's' : ''
        );
        
        if ($service->price_per_person) {
            $descriptionParts[] = sprintf(
                '💰 %s %s per person',
                $service->currency,
                number_format($service->price_per_person, 0)
            );
        }

        if ($service->stops && $service->stops->count() > 0) {
            $descriptionParts[] = sprintf(
                '🛑 %d Stop%s Included',
                $service->stops->count(),
                $service->stops->count() !== 1 ? 's' : ''
            );
        }

        $description = implode(' • ', $descriptionParts);
        $description .= ' | Book your ride on Asaancar - Pakistan\'s trusted ride sharing platform.';

        return [
            'title' => $title,
            'description' => $description,
            'image' => $imageUrl,
            'url' => $pageUrl,
            'type' => 'website',
            'site_name' => 'Asaancar',
        ];
    }

    /**
     * Get meta tags for pick-and-drop listing page
     */
    private function getPickAndDropListingMetaTags(Request $request): array
    {
        $baseUrl = $request->getScheme() . '://' . $request->getHttpHost();
        $pageUrl = $baseUrl . $request->getPathInfo();
        // Use feature image (image.png) if available, otherwise fallback to logo or icon
        $imageUrl = $baseUrl . (file_exists(public_path('image.png')) ? '/image.png' : (file_exists(public_path('logo.svg')) ? '/logo.svg' : '/icon.png'));

        return [
            'title' => 'Pick & Drop Services - Find Rides with Multiple Stops | Asaancar',
            'description' => '🚗 Find convenient pick and drop services from location A to location B with multiple stops. 👥 Book rides with male or female drivers. 🔍 Search by start location, end location, departure time, and driver gender. 📍 Available in Karachi and across Pakistan. | Asaancar - Pakistan\'s trusted ride sharing platform.',
            'image' => $imageUrl,
            'url' => $pageUrl,
            'type' => 'website',
            'site_name' => 'Asaancar',
        ];
    }

    /**
     * Inject meta tags into HTML content
     */
    private function injectMetaTags(string $content, array $metaTags): string
    {
        $metaHtml = $this->generateMetaTagsHtml($metaTags);
        
        // Replace existing title with the new one
        $newTitle = sprintf('<title>%s</title>', htmlspecialchars($metaTags['title'], ENT_QUOTES, 'UTF-8'));
        $content = preg_replace('/<title.*?>.*?<\/title>/is', $newTitle, $content);
        
        // Remove the title from metaHtml since we already replaced it
        $metaHtmlWithoutTitle = preg_replace('/<title>.*?<\/title>\n?/is', '', $metaHtml);
        
        // Try to inject before </head>
        if (strpos($content, '</head>') !== false) {
            return str_replace('</head>', $metaHtmlWithoutTitle . '</head>', $content);
        }
        
        // Fallback: inject after <head>
        if (strpos($content, '<head>') !== false) {
            return str_replace('<head>', '<head>' . $metaHtmlWithoutTitle, $content);
        }
        
        // Last resort: inject at the beginning
        return $metaHtmlWithoutTitle . $content;
    }

    /**
     * Generate HTML for meta tags
     */
    private function generateMetaTagsHtml(array $metaTags): string
    {
        $html = "\n";
        
        // Title
        $html .= sprintf('<title>%s</title>', htmlspecialchars($metaTags['title'], ENT_QUOTES, 'UTF-8')) . "\n";
        
        // Basic meta tags
        $html .= sprintf('<meta name="title" content="%s">', htmlspecialchars($metaTags['title'], ENT_QUOTES, 'UTF-8')) . "\n";
        $html .= sprintf('<meta name="description" content="%s">', htmlspecialchars($metaTags['description'], ENT_QUOTES, 'UTF-8')) . "\n";
        $html .= '<meta name="keywords" content="pick and drop, ride sharing, carpool, transportation, Pakistan, Karachi, ride booking, shared rides, daily commute">' . "\n";
        $html .= '<meta name="robots" content="index, follow">' . "\n";
        $html .= sprintf('<meta name="author" content="%s">', htmlspecialchars($metaTags['site_name'], ENT_QUOTES, 'UTF-8')) . "\n";
        
        // Open Graph meta tags (Facebook)
        $html .= sprintf('<meta property="og:title" content="%s">', htmlspecialchars($metaTags['title'], ENT_QUOTES, 'UTF-8')) . "\n";
        $html .= sprintf('<meta property="og:description" content="%s">', htmlspecialchars($metaTags['description'], ENT_QUOTES, 'UTF-8')) . "\n";
        $html .= sprintf('<meta property="og:image" content="%s">', htmlspecialchars($metaTags['image'], ENT_QUOTES, 'UTF-8')) . "\n";
        // Facebook recommends 1200x630px for optimal display
        $html .= '<meta property="og:image:width" content="1200">' . "\n";
        $html .= '<meta property="og:image:height" content="630">' . "\n";
        $html .= sprintf('<meta property="og:image:alt" content="%s">', htmlspecialchars($metaTags['title'], ENT_QUOTES, 'UTF-8')) . "\n";
        $html .= sprintf('<meta property="og:url" content="%s">', htmlspecialchars($metaTags['url'], ENT_QUOTES, 'UTF-8')) . "\n";
        $html .= sprintf('<meta property="og:type" content="%s">', htmlspecialchars($metaTags['type'], ENT_QUOTES, 'UTF-8')) . "\n";
        $html .= sprintf('<meta property="og:site_name" content="%s">', htmlspecialchars($metaTags['site_name'], ENT_QUOTES, 'UTF-8')) . "\n";
        $html .= '<meta property="og:locale" content="en_US">' . "\n";
        
        // Twitter Card meta tags
        $html .= '<meta name="twitter:card" content="summary_large_image">' . "\n";
        $html .= sprintf('<meta name="twitter:title" content="%s">', htmlspecialchars($metaTags['title'], ENT_QUOTES, 'UTF-8')) . "\n";
        $html .= sprintf('<meta name="twitter:description" content="%s">', htmlspecialchars($metaTags['description'], ENT_QUOTES, 'UTF-8')) . "\n";
        $html .= sprintf('<meta name="twitter:image" content="%s">', htmlspecialchars($metaTags['image'], ENT_QUOTES, 'UTF-8')) . "\n";
        $html .= sprintf('<meta name="twitter:image:alt" content="%s">', htmlspecialchars($metaTags['title'], ENT_QUOTES, 'UTF-8')) . "\n";
        
        // Canonical URL
        $html .= sprintf('<link rel="canonical" href="%s">', htmlspecialchars($metaTags['url'], ENT_QUOTES, 'UTF-8')) . "\n";
        
        return $html;
    }
}

