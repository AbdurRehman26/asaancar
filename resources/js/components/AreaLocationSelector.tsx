import { ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AreaOption, CityOption, KARACHI_CITY_ID } from '@/hooks/use-location-options';

interface AreaLocationSelectorProps {
    label: string;
    cities: CityOption[];
    areas: AreaOption[];
    cityId: string;
    areaId: string;
    required?: boolean;
    areaPlaceholder?: string;
    fieldClassName?: string;
    labelClassName?: string;
    onChange: (selection: { cityId: string; areaId: string; location: string }) => void;
}

export default function AreaLocationSelector({
    label,
    cities,
    areas,
    cityId,
    areaId,
    required = false,
    areaPlaceholder = 'Select area',
    fieldClassName = 'w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white',
    labelClassName = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300',
    onChange,
}: AreaLocationSelectorProps) {
    const fixedCity = cities.find((city) => city.id === KARACHI_CITY_ID);
    const effectiveCityId = fixedCity ? fixedCity.id.toString() : cityId;
    const availableAreas = useMemo(
        () => (effectiveCityId ? areas.filter((option) => option.city_id === Number(effectiveCityId)) : []),
        [areas, effectiveCityId],
    );
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const selectedArea = availableAreas.find((option) => option.id === Number(areaId));
    const filteredAreas = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (normalizedQuery === '') {
            return availableAreas;
        }

        return availableAreas.filter((area) => area.name.toLowerCase().includes(normalizedQuery));
    }, [availableAreas, query]);

    useEffect(() => {
        if (!isOpen) {
            setQuery(selectedArea?.name ?? '');
        }
    }, [isOpen, selectedArea]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <div>
            <label className={labelClassName}>
                {label}
                {required ? ' *' : ''}
            </label>
            <div ref={containerRef} className={`relative space-y-2 ${isOpen ? 'z-40' : ''}`}>
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8a7286] dark:text-white/45" />
                    <input
                        type="text"
                        value={isOpen ? query : (selectedArea?.name ?? '')}
                        onFocus={() => {
                            setIsOpen(true);
                            setQuery(selectedArea?.name ?? '');
                        }}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setIsOpen(true);

                            if (event.target.value.trim() === '') {
                                onChange({
                                    cityId: effectiveCityId,
                                    areaId: '',
                                    location: '',
                                });
                            }
                        }}
                        placeholder={areaPlaceholder}
                        disabled={!effectiveCityId}
                        className={`${fieldClassName} pr-10 pl-10`}
                    />
                    <ChevronDown
                        className={`pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#8a7286] transition-transform dark:text-white/45 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>

                {isOpen ? (
                    <div className="absolute top-full left-0 z-[60] mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-[#7e246c]/12 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#221b2a]">
                        <button
                            type="button"
                            onClick={() => {
                                onChange({
                                    cityId: effectiveCityId,
                                    areaId: '',
                                    location: '',
                                });
                                setQuery('');
                                setIsOpen(false);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#6b5368] transition-colors hover:bg-[#fcf2fb] dark:text-white/70 dark:hover:bg-white/6"
                        >
                            Clear selection
                        </button>

                        {filteredAreas.length > 0 ? (
                            filteredAreas.map((area) => (
                                <button
                                    key={area.id}
                                    type="button"
                                    onClick={() => {
                                        onChange({
                                            cityId: effectiveCityId,
                                            areaId: area.id.toString(),
                                            location: area.name,
                                        });
                                        setQuery(area.name);
                                        setIsOpen(false);
                                    }}
                                    className={`mt-1 w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                        area.id === Number(areaId)
                                            ? 'bg-[#7e246c] text-white'
                                            : 'text-[#2b1128] hover:bg-[#fcf2fb] dark:text-white dark:hover:bg-white/6'
                                    }`}
                                >
                                    {area.name}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-[#8a7286] dark:text-white/45">No areas found.</div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
