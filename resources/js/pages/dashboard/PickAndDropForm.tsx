import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Plus, X, Save, ChevronDown } from 'lucide-react';
import { apiFetch } from '@/lib/utils';

interface Stop {
    location?: string;
    city_id?: number;
    area_id?: number;
    stop_date: string;
    stop_time: string;
    order: number;
    notes?: string;
}

export default function PickAndDropForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        start_location: '',
        pickup_city_id: undefined as number | undefined,
        pickup_area_id: undefined as number | undefined,
        end_location: '',
        dropoff_city_id: undefined as number | undefined,
        dropoff_area_id: undefined as number | undefined,
        departure_date: '',
        departure_time: '',
        schedule_type: 'once', // once, everyday, weekdays, weekends, custom
        selected_days: [] as string[],
        is_roundtrip: false,
        return_time: '',
        available_spaces: 1,
        driver_gender: 'male' as 'male' | 'female',
        car_brand: '',
        car_model: '',
        car_color: '',
        car_seats: '',
        car_transmission: '',
        car_fuel_type: '',
        description: '',
        price_per_person: '',
        currency: 'PKR',
        is_active: true,
    });

    const [stops, setStops] = useState<Stop[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
    const [areas, setAreas] = useState<{ [cityId: number]: { id: number; name: string }[] }>({});
    const [openDropdowns, setOpenDropdowns] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        // Fetch cities
        fetch('/api/cities')
            .then(res => res.json())
            .then(data => {
                const allCities = data.data || data;
                setCities(Array.isArray(allCities) ? allCities : []);

                // Set Karachi as default for both pickup and dropoff
                const karachi = Array.isArray(allCities) ? allCities.find(c => c.name.toLowerCase() === 'karachi') : null;
                if (karachi && !isEditing) {
                    setFormData(prev => ({
                        ...prev,
                        pickup_city_id: karachi.id,
                        dropoff_city_id: karachi.id,
                    }));
                    // Fetch areas for Karachi
                    fetchAreasForCity(karachi.id);
                }
            })
            .catch(() => setCities([]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isEditing && id) {
            fetchService();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEditing]);

    const fetchService = async () => {
        try {
            const response = await apiFetch(`/api/pick-and-drop/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch service');
            }
            const data = await response.json();
            const service = data.data || data;

            setFormData({
                name: service.name || '',
                contact: service.contact || '',
                start_location: service.start_location || '',
                pickup_city_id: service.pickup_city_id || undefined,
                pickup_area_id: service.pickup_area_id || undefined,
                end_location: service.end_location || '',
                dropoff_city_id: service.dropoff_city_id || undefined,
                dropoff_area_id: service.dropoff_area_id || undefined,
                departure_date: service.departure_time ? new Date(service.departure_time).toISOString().slice(0, 10) : '',
                departure_time: service.departure_time ? new Date(service.departure_time).toISOString().slice(11, 16) : '',
                schedule_type: service.schedule_type || (service.is_everyday ? 'everyday' : 'once'),
                selected_days: service.selected_days || [],
                is_roundtrip: service.is_roundtrip || false,
                return_time: service.return_time ? service.return_time.slice(0, 5) : '',
                available_spaces: service.available_spaces || 1,
                driver_gender: service.driver_gender || 'male',
                car_brand: service.car_brand || '',
                car_model: service.car_model || '',
                car_color: service.car_color || '',
                car_seats: service.car_seats?.toString() || '',
                car_transmission: service.car_transmission || '',
                car_fuel_type: service.car_fuel_type || '',
                description: service.description || '',
                price_per_person: service.price_per_person?.toString() || '',
                currency: service.currency || 'PKR',
                is_active: service.is_active ?? true,
            });

            // Fetch areas for pickup and dropoff cities if they exist
            if (service.pickup_city_id) {
                fetchAreasForCity(service.pickup_city_id);
            }
            if (service.dropoff_city_id) {
                fetchAreasForCity(service.dropoff_city_id);
            }

            if (service.stops && Array.isArray(service.stops)) {
                // Find Karachi to ensure all stops use Karachi
                const karachi = cities.find(c => c.name.toLowerCase() === 'karachi');

                interface StopData {
                    location?: string;
                    city_id?: number;
                    area_id?: number;
                    stop_time?: string;
                    order?: number;
                    notes?: string;
                }
                const departureDate = service.departure_time ? new Date(service.departure_time).toISOString().slice(0, 10) : '';
                setStops(service.stops.map((stop: StopData) => ({
                    location: stop.location || '',
                    city_id: karachi?.id || stop.city_id || undefined, // Force Karachi
                    area_id: stop.area_id || undefined,
                    stop_date: stop.stop_time ? new Date(stop.stop_time).toISOString().slice(0, 10) : departureDate,
                    stop_time: stop.stop_time ? new Date(stop.stop_time).toISOString().slice(11, 16) : '',
                    order: stop.order || 0,
                    notes: stop.notes || '',
                })));

                // Fetch areas for Karachi if not already fetched
                if (karachi && !areas[karachi.id]) {
                    fetchAreasForCity(karachi.id);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load service');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Ensure Karachi is always set (find Karachi city)
            const karachi = cities.find(c => c.name.toLowerCase() === 'karachi');
            if (!karachi) {
                throw new Error('Karachi city not found. Please refresh the page.');
            }

            // Force Karachi for both pickup and dropoff
            const pickupCityId = karachi.id;
            const dropoffCityId = karachi.id;

            // Auto-populate start_location and end_location from selected areas
            let startLocation = formData.start_location;
            let endLocation = formData.end_location;

            if (formData.pickup_area_id) {
                const pickupArea = areas[pickupCityId]?.find(a => a.id === formData.pickup_area_id);
                if (pickupArea) {
                    startLocation = pickupArea.name;
                }
            }

            if (formData.dropoff_area_id) {
                const dropoffArea = areas[dropoffCityId]?.find(a => a.id === formData.dropoff_area_id);
                if (dropoffArea) {
                    endLocation = dropoffArea.name;
                }
            }

            const payload = {
                ...formData,
                start_location: startLocation,
                end_location: endLocation,
                pickup_city_id: pickupCityId,
                pickup_area_id: formData.pickup_area_id || null,
                dropoff_city_id: dropoffCityId,
                dropoff_area_id: formData.dropoff_area_id || null,
                departure_time: formData.schedule_type === 'once' && formData.departure_date && formData.departure_time
                    ? `${formData.departure_date}T${formData.departure_time}:00`
                    : formData.schedule_type !== 'once' && formData.departure_time
                        ? `2000-01-01T${formData.departure_time}:00` // Use a placeholder date for recurring services
                        : formData.departure_time,
                schedule_type: formData.schedule_type,
                selected_days: formData.schedule_type === 'custom' ? formData.selected_days : null,
                is_roundtrip: formData.is_roundtrip,
                return_time: formData.is_roundtrip && formData.return_time ? formData.return_time : null,
                is_everyday: formData.schedule_type === 'everyday', // Keep for backward compatibility if needed
                available_spaces: parseInt(formData.available_spaces.toString()),
                car_seats: formData.car_seats ? parseInt(formData.car_seats) : null,
                price_per_person: formData.price_per_person ? parseFloat(formData.price_per_person) : null,
                stops: stops.map((stop, index) => {
                    // Ensure Karachi is always set for stops
                    const karachi = cities.find(c => c.name.toLowerCase() === 'karachi');
                    const stopCityId = karachi?.id || stop.city_id;

                    // Auto-populate location from area if not set
                    let stopLocation = stop.location;
                    if (!stopLocation && stop.area_id && karachi) {
                        const area = areas[karachi.id]?.find(a => a.id === stop.area_id);
                        if (area) {
                            stopLocation = area.name;
                        }
                    }

                    return {
                        location: stopLocation || null,
                        city_id: stopCityId || null,
                        area_id: stop.area_id || null,
                        stop_time: formData.schedule_type === 'once' && stop.stop_date && stop.stop_time
                            ? `${stop.stop_date}T${stop.stop_time}:00`
                            : formData.schedule_type !== 'once' && stop.stop_time
                                ? `2000-01-01T${stop.stop_time}:00` // Use a placeholder date for recurring services
                                : stop.stop_time,
                        order: stop.order || index,
                        notes: stop.notes || null,
                    };
                }),
            };

            const url = isEditing
                ? `/api/customer/pick-and-drop/${id}`
                : '/api/customer/pick-and-drop';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await apiFetch(url, {
                method,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save service');
            }

            navigate('/dashboard/pick-and-drop');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save service');
        } finally {
            setLoading(false);
        }
    };

    const fetchAreasForCity = async (cityId: number): Promise<void> => {
        if (areas[cityId]) return Promise.resolve(); // Already fetched

        try {
            const response = await fetch(`/api/areas?city_id=${cityId}`);
            const data = await response.json();
            setAreas(prev => ({
                ...prev,
                [cityId]: data.data || []
            }));
            return Promise.resolve();
        } catch (err) {
            console.error('Error fetching areas:', err);
            return Promise.resolve();
        }
    };

    const addStop = () => {
        // Find Karachi city ID
        const karachi = cities.find(c => c.name.toLowerCase() === 'karachi');
        if (!karachi) {
            setError('Karachi city not found. Please refresh the page.');
            return;
        }

        setStops([
            ...stops,
            {
                location: '',
                city_id: karachi.id, // Auto-set to Karachi
                area_id: undefined,
                stop_date: formData.schedule_type === 'once' ? (formData.departure_date || '') : '', // Default to departure date if once
                stop_time: '',
                order: stops.length,
                notes: '',
            },
        ]);

        // Fetch areas for Karachi if not already fetched
        if (!areas[karachi.id]) {
            fetchAreasForCity(karachi.id);
        }
    };

    const removeStop = (index: number) => {
        setStops(stops.filter((_, i) => i !== index));
    };

    const updateStop = (index: number, field: keyof Stop, value: string | number | undefined) => {
        const newStops = [...stops];

        // Ensure city_id is always Karachi for stops
        const karachi = cities.find(c => c.name.toLowerCase() === 'karachi');
        if (karachi) {
            newStops[index].city_id = karachi.id;

            // Fetch areas for Karachi if not already fetched
            if (!areas[karachi.id]) {
                fetchAreasForCity(karachi.id);
            }
        }

        newStops[index] = { ...newStops[index], [field]: value };
        setStops(newStops);
    };

    // Stop Location Input Component with dropdown
    const StopLocationInput = ({
        value,
        onChange,
        onAreaSelect,
        cities,
        areas,
        index,
        openDropdowns,
        setOpenDropdowns
    }: {
        value: string;
        onChange: (location: string) => void;
        onAreaSelect: (areaId: number, areaName: string) => void;
        cities: { id: number; name: string }[];
        areas: { [cityId: number]: { id: number; name: string }[] };
        index: number;
        openDropdowns: { [key: number]: boolean };
        setOpenDropdowns: (updater: (prev: { [key: number]: boolean }) => { [key: number]: boolean }) => void;
    }) => {
        const dropdownRef = useRef<HTMLDivElement>(null);
        const karachi = cities.find(c => c.name.toLowerCase() === 'karachi');
        const availableAreas = karachi && areas[karachi.id] ? areas[karachi.id] : [];
        const filteredAreas = availableAreas.filter(area =>
            !value || area.name.toLowerCase().includes(value.toLowerCase())
        );

        useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setOpenDropdowns(prev => ({ ...prev, [index]: false }));
                }
            }

            if (openDropdowns[index]) {
                document.addEventListener('mousedown', handleClickOutside);
                return () => document.removeEventListener('mousedown', handleClickOutside);
            }
        }, [openDropdowns, index, setOpenDropdowns]);

        return (
            <div className="relative" ref={dropdownRef}>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        // Show dropdown when typing if areas are available
                        if (availableAreas.length > 0) {
                            setOpenDropdowns(prev => ({ ...prev, [index]: true }));
                        }
                    }}
                    onFocus={() => {
                        // Show dropdown if areas are available
                        if (availableAreas.length > 0) {
                            setOpenDropdowns(prev => ({ ...prev, [index]: true }));
                        }
                    }}
                    placeholder="Enter stop location or select from dropdown"
                    required
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                />
                {availableAreas.length > 0 && (
                    <>
                        <ChevronDown
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                        />
                        {openDropdowns[index] && filteredAreas.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                {filteredAreas.map((area) => (
                                    <button
                                        key={area.id}
                                        type="button"
                                        onClick={() => {
                                            onAreaSelect(area.id, area.name);
                                            setOpenDropdowns(prev => ({ ...prev, [index]: false }));
                                        }}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white"
                                    >
                                        {area.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    // Searchable Area Selector Component
    const SearchableAreaSelect = ({
        value,
        onChange,
        cityId,
        areas,
        label,
        required = false,
        disabled = false
    }: {
        value: number | undefined;
        onChange: (areaId: number | undefined) => void;
        cityId: number | undefined;
        areas: { [cityId: number]: { id: number; name: string }[] };
        label: string;
        required?: boolean;
        disabled?: boolean;
    }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');
        const dropdownRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLInputElement>(null);

        const availableAreas = cityId ? (areas[cityId] || []) : [];
        const selectedArea = value ? availableAreas.find(a => a.id === value) : null;

        // Close dropdown when clicking outside
        useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            }

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const filteredAreas = availableAreas.filter(area =>
            area.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const handleSelect = (areaId: number) => {
            onChange(areaId);
            setIsOpen(false);
            setSearchTerm('');
        };

        const handleClear = () => {
            onChange(undefined);
            setSearchTerm('');
        };

        return (
            <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label} {required && '*'}
                </label>
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        required={required}
                        value={selectedArea ? selectedArea.name : searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                            if (!e.target.value) {
                                onChange(undefined);
                            }
                        }}
                        onFocus={() => {
                            if (cityId) {
                                setIsOpen(true);
                            }
                        }}
                        placeholder="Search or select area..."
                        disabled={disabled || !cityId}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {selectedArea && !disabled && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClear();
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>

                {isOpen && cityId && availableAreas.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredAreas.length > 0 ? (
                            filteredAreas.map((area) => (
                                <button
                                    key={area.id}
                                    type="button"
                                    onClick={() => handleSelect(area.id)}
                                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white ${value === area.id ? 'bg-[#7e246c]/10 dark:bg-[#7e246c]/20' : ''
                                        }`}
                                >
                                    {area.name}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                                No areas found for "{searchTerm}"
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-[#7e246c] dark:text-white mb-6">
                {isEditing ? 'Edit' : 'Create'} Pick & Drop Service
            </h1>

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Karachi Availability Notice */}
                <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 ring-1 ring-blue-700/20 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-300/20">
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Currently available in Karachi only. We'll be expanding to other cities soon!
                </div>

                {/* Route Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-[#7e246c] dark:text-white mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Route Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SearchableAreaSelect
                            value={formData.pickup_area_id}
                            onChange={(areaId) => setFormData({ ...formData, pickup_area_id: areaId })}
                            cityId={formData.pickup_city_id}
                            areas={areas}
                            label="Start Area"
                            required={true}
                            disabled={!formData.pickup_city_id}
                        />
                        <SearchableAreaSelect
                            value={formData.dropoff_area_id}
                            onChange={(areaId) => setFormData({ ...formData, dropoff_area_id: areaId })}
                            cityId={formData.dropoff_city_id}
                            areas={areas}
                            label="End Area"
                            required={true}
                            disabled={!formData.dropoff_city_id}
                        />
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Schedule Type
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    {[
                                        { id: 'once', label: 'One-time' },
                                        { id: 'everyday', label: 'Everyday' },
                                        { id: 'weekdays', label: 'Weekdays' },
                                        { id: 'weekends', label: 'Weekends' },
                                        { id: 'custom', label: 'Custom' }
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, schedule_type: type.id });
                                                if (type.id !== 'once') {
                                                    setFormData(prev => ({ ...prev, departure_date: '' }));
                                                    // Clear stop dates for recurring
                                                    setStops(stops.map(stop => ({ ...stop, stop_date: '' })));
                                                }
                                            }}
                                            className={`px-3 py-2 text-sm font-medium rounded-lg border ${formData.schedule_type === type.id
                                                ? 'bg-[#7e246c] text-white border-[#7e246c]'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.schedule_type === 'custom' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select Days
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => {
                                                    const currentDays = formData.selected_days || [];
                                                    const newDays = currentDays.includes(day)
                                                        ? currentDays.filter(d => d !== day)
                                                        : [...currentDays, day];
                                                    setFormData({ ...formData, selected_days: newDays });
                                                }}
                                                className={`px-3 py-1 text-xs font-medium rounded-full border ${formData.selected_days?.includes(day)
                                                    ? 'bg-[#7e246c] text-white border-[#7e246c]'
                                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_roundtrip}
                                    onChange={(e) => setFormData({ ...formData, is_roundtrip: e.target.checked })}
                                    className="w-4 h-4 text-[#7e246c] border-gray-300 rounded focus:ring-[#7e246c]"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Round Trip (Return on the same day/schedule)
                                </span>
                            </div>
                        </div>
                        {formData.schedule_type === 'once' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Departure Date *
                                </label>
                                <input
                                    type="date"
                                    required={formData.schedule_type === 'once'}
                                    value={formData.departure_date}
                                    onChange={(e) => {
                                        const newDate = e.target.value;
                                        setFormData({ ...formData, departure_date: newDate });
                                        // Update all stop dates to match departure date
                                        setStops(stops.map(stop => ({ ...stop, stop_date: newDate })));
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Departure Time *
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.departure_time}
                                    onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {formData.is_roundtrip && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Return Time *
                                    </label>
                                    <input
                                        type="time"
                                        required={formData.is_roundtrip}
                                        value={formData.return_time}
                                        onChange={(e) => setFormData({ ...formData, return_time: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-[#7e246c] dark:text-white mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Contact Information (Optional)
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        If provided, these will be used as contact information. Otherwise, your account information will be used.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Contact Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter contact name (optional)"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Contact Number
                            </label>
                            <input
                                type="text"
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                placeholder="Enter contact number (optional)"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Service Details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-[#7e246c] dark:text-white mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Service Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Available Spaces *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.available_spaces}
                                onChange={(e) => setFormData({ ...formData, available_spaces: parseInt(e.target.value) || 1 })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Driver Gender *
                            </label>
                            <select
                                required
                                value={formData.driver_gender}
                                onChange={(e) => setFormData({ ...formData, driver_gender: e.target.value as 'male' | 'female' })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Price Per Person
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price_per_person}
                                    onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                                />
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="PKR">PKR</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Active
                            </label>
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="h-5 w-5 text-[#7e246c] focus:ring-[#7e246c] rounded"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Car Details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-[#7e246c] dark:text-white mb-4">Car Details (Optional)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Car Brand
                            </label>
                            <input
                                type="text"
                                value={formData.car_brand}
                                onChange={(e) => setFormData({ ...formData, car_brand: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Car Model
                            </label>
                            <input
                                type="text"
                                value={formData.car_model}
                                onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Car Color
                            </label>
                            <input
                                type="text"
                                value={formData.car_color}
                                onChange={(e) => setFormData({ ...formData, car_color: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Seats
                            </label>
                            <input
                                type="number"
                                value={formData.car_seats}
                                onChange={(e) => setFormData({ ...formData, car_seats: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Transmission
                            </label>
                            <select
                                value={formData.car_transmission}
                                onChange={(e) => setFormData({ ...formData, car_transmission: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Select</option>
                                <option value="manual">Manual</option>
                                <option value="automatic">Automatic</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fuel Type
                            </label>
                            <select
                                value={formData.car_fuel_type}
                                onChange={(e) => setFormData({ ...formData, car_fuel_type: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Select</option>
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="electric">Electric</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stops */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-[#7e246c] dark:text-white">Stops (Optional)</h2>
                        <button
                            type="button"
                            onClick={addStop}
                            className="flex items-center gap-2 px-4 py-2 bg-[#7e246c] text-white rounded-lg hover:bg-[#6a1f5c] transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Add Stop
                        </button>
                    </div>
                    {stops.map((stop, index) => (
                        <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-medium text-gray-700 dark:text-gray-300">Stop {index + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => removeStop(index)}
                                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Stop Location *
                                    </label>
                                    <StopLocationInput
                                        value={stop.location || ''}
                                        onChange={(location) => {
                                            updateStop(index, 'location', location);
                                            // Clear area_id when manually typing
                                            if (location !== stop.location) {
                                                updateStop(index, 'area_id', undefined);
                                            }
                                        }}
                                        onAreaSelect={(areaId, areaName) => {
                                            // Update both location and area_id together in a single state update
                                            const newStops = stops.map((s, i) => {
                                                if (i === index) {
                                                    const karachi = cities.find(c => c.name.toLowerCase() === 'karachi');
                                                    return {
                                                        ...s,
                                                        location: areaName,
                                                        area_id: areaId,
                                                        city_id: karachi?.id || s.city_id
                                                    };
                                                }
                                                return s;
                                            });
                                            setStops(newStops);
                                        }}
                                        cities={cities}
                                        areas={areas}
                                        index={index}
                                        openDropdowns={openDropdowns}
                                        setOpenDropdowns={setOpenDropdowns}
                                    />
                                </div>
                                {formData.schedule_type === 'once' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Stop Date *
                                        </label>
                                        <input
                                            type="date"
                                            required={formData.schedule_type === 'once'}
                                            value={stop.stop_date}
                                            onChange={(e) => updateStop(index, 'stop_date', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Stop Time *
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={stop.stop_time}
                                        onChange={(e) => updateStop(index, 'stop_time', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={stop.notes}
                                        onChange={(e) => updateStop(index, 'notes', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {stops.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No stops added. Click "Add Stop" to add intermediate stops.</p>
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-[#7e246c] text-white rounded-lg hover:bg-[#6a1f5c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="h-5 w-5" />
                        {loading ? 'Saving...' : isEditing ? 'Update Service' : 'Create Service'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/pick-and-drop')}
                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

