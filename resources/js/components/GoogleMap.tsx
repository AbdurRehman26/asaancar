import { GoogleMap, Marker, Polyline, StandaloneSearchBox, useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const GOOGLE_MAP_LIBRARIES = ['places'];

const containerStyle = {
    width: '100%',
    height: '400px',
};

const defaultCenter = {
    lat: 24.8607, // Default to Karachi
    lng: 67.0011,
};

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface MapComponentProps {
    center?: google.maps.LatLngLiteral;
    zoom?: number;
    markerPosition?: google.maps.LatLngLiteral;
    markers?: Array<{
        id: string;
        label?: string;
        position: google.maps.LatLngLiteral;
        title?: string;
    }>;
    path?: google.maps.LatLngLiteral[];
    showFixedPin?: boolean;
    onMapClick?: (data: { lat: number; lng: number; address?: string }) => void;
    onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
    showSearchBox?: boolean;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    onMapDragEnd?: (data: { lat: number; lng: number; address?: string }) => void;
}

// Add this helper function
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    if (!window.google || !window.google.maps) return null;
    return new Promise((resolve) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                resolve(results[0].formatted_address);
            } else {
                resolve(null);
            }
        });
    });
}

const MapComponent: React.FC<MapComponentProps> = ({
    center = defaultCenter,
    zoom = 12,
    markerPosition,
    markers = [],
    path = [],
    showFixedPin = true,
    onMapClick,
    onPlaceSelected,
    showSearchBox = false,
    searchValue,
    onSearchChange,
    onMapDragEnd,
}) => {
    // @ts-expect-error: @react-google-maps/api types mismatch, safe to ignore
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
        libraries: GOOGLE_MAP_LIBRARIES,
    });
    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
    const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    const onLoadSearchBox = useCallback((ref: google.maps.places.SearchBox) => {
        searchBoxRef.current = ref;
        setSearchBox(ref);
    }, []);

    const handlePlacesChanged = () => {
        if (searchBox && onPlaceSelected) {
            const places = searchBox.getPlaces();
            if (places && places.length > 0) {
                onPlaceSelected(places[0]);
            }
        }
    };

    const handleMapCenterChanged = async () => {
        const map = (window as unknown as { googleMapInstance?: google.maps.Map }).googleMapInstance;
        if (map) {
            const center = map.getCenter();
            if (!center) return;
            const lat = center.lat();
            const lng = center.lng();
            let address: string | undefined = undefined;
            if (window.google && window.google.maps) {
                address = (await reverseGeocode(lat, lng)) || undefined;
            }
            if (onMapDragEnd) {
                onMapDragEnd({ lat, lng, address });
            }
            if (onMapClick) {
                onMapClick({ lat, lng, address });
            }
        }
    };

    const mapOptions = {
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
    };

    const visibleMarkers = useMemo(() => {
        if (markers.length > 0) {
            return markers;
        }

        if (markerPosition) {
            return [{ id: 'selected-marker', position: markerPosition }];
        }

        return [];
    }, [markers, markerPosition]);

    const pathPoints = useMemo(() => {
        if (path.length > 0) {
            return path;
        }

        return visibleMarkers.map((marker) => marker.position);
    }, [path, visibleMarkers]);

    const fitToBounds = useCallback(() => {
        const map = mapRef.current;

        if (!map || !window.google?.maps) {
            return;
        }

        const bounds = new window.google.maps.LatLngBounds();
        const points = [...visibleMarkers.map((marker) => marker.position), ...pathPoints];

        if (points.length === 0) {
            return;
        }

        points.forEach((point) => bounds.extend(point));
        map.fitBounds(bounds, 64);

        if (points.length === 1) {
            map.setZoom(14);
        }
    }, [pathPoints, visibleMarkers]);

    useEffect(() => {
        fitToBounds();
    }, [fitToBounds]);

    return isLoaded ? (
        <div style={{ position: 'relative' }}>
            {showSearchBox && (
                <StandaloneSearchBox onLoad={onLoadSearchBox} onPlacesChanged={handlePlacesChanged}>
                    <input
                        type="text"
                        placeholder="Search address..."
                        value={typeof searchValue === 'string' ? searchValue : ''}
                        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                        className="absolute top-4 left-1/2 z-10 w-80 -translate-x-1/2 rounded-md border bg-white px-4 py-2 shadow focus:outline-none"
                        style={{ position: 'absolute', left: '50%', top: 16, transform: 'translateX(-50%)', width: 320 }}
                    />
                </StandaloneSearchBox>
            )}
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={visibleMarkers[0]?.position || center}
                zoom={zoom}
                options={mapOptions}
                onDragEnd={() => {
                    const map = (window as unknown as { googleMapInstance?: google.maps.Map }).googleMapInstance;
                    if (map) {
                        handleMapCenterChanged();
                    }
                }}
                onLoad={(map) => {
                    mapRef.current = map;
                    (window as unknown as { googleMapInstance?: google.maps.Map }).googleMapInstance = map;
                    fitToBounds();
                }}
            >
                {visibleMarkers.map((marker) => (
                    <Marker key={marker.id} position={marker.position} title={marker.title} label={marker.label} />
                ))}
                {pathPoints.length > 1 && (
                    <Polyline
                        path={pathPoints}
                        options={{
                            strokeColor: '#7e246c',
                            strokeOpacity: 0.8,
                            strokeWeight: 4,
                        }}
                    />
                )}
            </GoogleMap>
            {showFixedPin && (
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -100%)',
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}
                >
                    <MapPin className="h-10 w-10 text-[#7e246c] drop-shadow-lg" />
                </div>
            )}
        </div>
    ) : (
        <div>Loading map...</div>
    );
};

export default React.memo(MapComponent);
