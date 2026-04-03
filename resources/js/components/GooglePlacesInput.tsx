import { Autocomplete, Libraries, useJsApiLoader } from '@react-google-maps/api';
import { useRef } from 'react';

const GOOGLE_PLACES_LIBRARIES: Libraries = ['places'];
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';

export interface SelectedPlace {
    address: string;
    placeId: string | null;
    latitude: number | null;
    longitude: number | null;
}

interface GooglePlacesInputProps {
    className?: string;
    onChange: (value: string) => void;
    onPlaceSelected: (place: SelectedPlace) => void;
    placeholder?: string;
    required?: boolean;
    value: string;
}

export default function GooglePlacesInput({
    className,
    onChange,
    onPlaceSelected,
    placeholder = 'Search for a place',
    required = false,
    value,
}: GooglePlacesInputProps) {
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const { isLoaded } = useJsApiLoader({
        id: 'google-places-script',
        googleMapsApiKey,
        libraries: GOOGLE_PLACES_LIBRARIES,
    });

    const input = (
        <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            required={required}
            className={className}
        />
    );

    if (!googleMapsApiKey || !isLoaded) {
        return input;
    }

    return (
        <Autocomplete
            onLoad={(autocomplete) => {
                autocompleteRef.current = autocomplete;
            }}
            onPlaceChanged={() => {
                const place = autocompleteRef.current?.getPlace();
                const location = place?.geometry?.location;

                onPlaceSelected({
                    address: place?.formatted_address ?? place?.name ?? value,
                    placeId: place?.place_id ?? null,
                    latitude: location?.lat() ?? null,
                    longitude: location?.lng() ?? null,
                });
            }}
            options={{
                componentRestrictions: { country: 'pk' },
                fields: ['formatted_address', 'geometry.location', 'name', 'place_id'],
            }}
        >
            {input}
        </Autocomplete>
    );
}
