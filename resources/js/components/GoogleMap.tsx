import React, { useRef, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

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
  // No marker, just a fixed pin overlay

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
        address = await reverseGeocode(lat, lng) || undefined;
      }
      if (onMapDragEnd) {
        onMapDragEnd({ lat, lng, address });
      }
      if (onMapClick) {
        onMapClick({ lat, lng, address });
      }
    }
  };

  return isLoaded ? (
    <div style={{ position: 'relative' }}>
      {showSearchBox && (
        <StandaloneSearchBox
          onLoad={onLoadSearchBox}
          onPlacesChanged={handlePlacesChanged}
        >
          <input
            type="text"
            placeholder="Search address..."
            value={typeof searchValue === 'string' ? searchValue : ''}
            onChange={e => onSearchChange && onSearchChange(e.target.value)}
            className="absolute z-10 left-1/2 top-4 -translate-x-1/2 w-80 rounded-md border px-4 py-2 shadow bg-white focus:outline-none"
            style={{ position: 'absolute', left: '50%', top: 16, transform: 'translateX(-50%)', width: 320 }}
          />
        </StandaloneSearchBox>
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition || center}
        zoom={zoom}
        onDragEnd={() => {
          const map = (window as unknown as { googleMapInstance?: google.maps.Map }).googleMapInstance;
          if (map) {
            handleMapCenterChanged();
          }
        }}
        onLoad={map => { (window as unknown as { googleMapInstance?: google.maps.Map }).googleMapInstance = map; }}
      />
      {/* Fixed pin icon overlay at center */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -100%)',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <MapPin className="w-10 h-10 text-[#7e246c] drop-shadow-lg" />
      </div>
    </div>
  ) : (
    <div>Loading map...</div>
  );
};

export default React.memo(MapComponent); 