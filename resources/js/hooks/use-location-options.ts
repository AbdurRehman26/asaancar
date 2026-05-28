import { apiFetch } from '@/lib/utils';
import { useEffect, useState } from 'react';

export interface CityOption {
    id: number;
    name: string;
}

export interface AreaOption {
    id: number;
    city_id: number;
    name: string;
    slug: string;
}

export const KARACHI_CITY_ID = 197;

let cachedCities: CityOption[] | null = null;
let cachedAreas: AreaOption[] | null = null;
let locationOptionsPromise: Promise<{ cities: CityOption[]; areas: AreaOption[] }> | null = null;

async function fetchLocationOptions(): Promise<{ cities: CityOption[]; areas: AreaOption[] }> {
    if (cachedCities && cachedAreas) {
        return {
            cities: cachedCities,
            areas: cachedAreas,
        };
    }

    if (!locationOptionsPromise) {
        locationOptionsPromise = (async () => {
            const [citiesResponse, areasResponse] = await Promise.all([apiFetch('/api/cities'), apiFetch('/api/areas')]);

            const citiesPayload = citiesResponse.ok ? await citiesResponse.json() : { data: [] };
            const areasPayload = areasResponse.ok ? await areasResponse.json() : { data: [] };

            cachedCities = Array.isArray(citiesPayload.data) ? citiesPayload.data : [];
            cachedAreas = Array.isArray(areasPayload.data) ? areasPayload.data : [];

            return {
                cities: cachedCities,
                areas: cachedAreas,
            };
        })();
    }

    return locationOptionsPromise;
}

export function buildAreaLocationLabel(
    areaId: number | string | null | undefined,
    cityId: number | string | null | undefined,
    cities: CityOption[],
    areas: AreaOption[],
): string {
    const normalizedAreaId = Number(areaId);

    const area = areas.find((option) => option.id === normalizedAreaId);

    if (!area) {
        return '';
    }

    return area.name;
}

export function inferAreaSelection(
    location: string | null | undefined,
    cities: CityOption[],
    areas: AreaOption[],
): { cityId: string; areaId: string } {
    const normalizedLocation = (location ?? '').trim().toLowerCase();

    if (normalizedLocation === '') {
        return { cityId: '', areaId: '' };
    }

    const sortedAreas = [...areas].sort((left, right) => right.name.length - left.name.length);

    for (const area of sortedAreas) {
        const city = cities.find((option) => option.id === area.city_id);

        if (!city) {
            continue;
        }

        const normalizedAreaName = area.name.trim().toLowerCase();
        const normalizedCityName = city.name.trim().toLowerCase();

        if (normalizedLocation.includes(normalizedAreaName) && normalizedLocation.includes(normalizedCityName)) {
            return {
                cityId: city.id.toString(),
                areaId: area.id.toString(),
            };
        }
    }

    for (const area of sortedAreas) {
        if (normalizedLocation === area.name.trim().toLowerCase()) {
            return {
                cityId: area.city_id.toString(),
                areaId: area.id.toString(),
            };
        }
    }

    return { cityId: '', areaId: '' };
}

export function useLocationOptions() {
    const [cities, setCities] = useState<CityOption[]>(cachedCities ?? []);
    const [areas, setAreas] = useState<AreaOption[]>(cachedAreas ?? []);
    const [loading, setLoading] = useState<boolean>(!cachedCities || !cachedAreas);

    useEffect(() => {
        let active = true;

        void fetchLocationOptions()
            .then((options) => {
                if (!active) {
                    return;
                }

                setCities(options.cities);
                setAreas(options.areas);
            })
            .finally(() => {
                if (!active) {
                    return;
                }

                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    return {
        cities,
        areas,
        loading,
    };
}
