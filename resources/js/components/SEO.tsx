import { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    siteName?: string;
}

export default function SEO({
    title = 'Pick & Drop Services - Asaancar',
    description = 'Find rides from location A to location B with multiple stops. Book convenient pick and drop services in Pakistan.',
    image = '/icon.png',
    url = typeof window !== 'undefined' ? window.location.href : '',
    type = 'website',
    siteName = 'Asaancar',
}: SEOProps) {
    useEffect(() => {
        // Helper to make URL absolute if it's relative
        const makeAbsoluteUrl = (url: string): string => {
            if (typeof window === 'undefined') return url;
            if (url.startsWith('http://') || url.startsWith('https://')) return url;
            if (url.startsWith('//')) return `https:${url}`;
            return `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`;
        };

        // Update or create meta tags
        const updateMetaTag = (property: string, content: string, isProperty = false) => {
            const attribute = isProperty ? 'property' : 'name';
            let element = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
            
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, property);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Update title
        document.title = title;

        // Ensure image URL is absolute for Open Graph
        const absoluteImageUrl = makeAbsoluteUrl(image);
        const absolutePageUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

        // Basic SEO meta tags
        updateMetaTag('title', title);
        updateMetaTag('description', description);
        updateMetaTag('keywords', 'pick and drop, ride sharing, carpool, transportation, Pakistan, Karachi, ride booking, shared rides, daily commute');

        // Open Graph meta tags (Facebook)
        updateMetaTag('og:title', title, true);
        updateMetaTag('og:description', description, true);
        updateMetaTag('og:image', absoluteImageUrl, true);
        updateMetaTag('og:url', absolutePageUrl, true);
        updateMetaTag('og:type', type, true);
        updateMetaTag('og:site_name', siteName, true);
        updateMetaTag('og:locale', 'en_US', true);

        // Twitter Card meta tags
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:image', absoluteImageUrl);

        // Additional meta tags
        updateMetaTag('robots', 'index, follow');
        updateMetaTag('author', siteName);

        // Canonical URL
        let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', absolutePageUrl);

        // Cleanup function (optional - can restore default title if needed)
        return () => {
            // Meta tags will be updated on next render, so no cleanup needed
        };
    }, [title, description, image, url, type, siteName]);

    return null; // This component doesn't render anything
}

