import GooglePlacesInput from '@/components/GooglePlacesInput';
import { apiFetch } from '@/lib/utils';
import { Calendar, MapPin, Plus, Save, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Stop {
    location?: string;
    place_id?: string | null;
    latitude?: number | null;
    longitude?: number | null;
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
        start_place_id: null as string | null,
        start_latitude: null as number | null,
        start_longitude: null as number | null,
        end_location: '',
        end_place_id: null as string | null,
        end_latitude: null as number | null,
        end_longitude: null as number | null,
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

            // Helper function to safely parse date/time from various formats
            const parseDateTime = (dateTimeStr: string | null | undefined): { date: string; time: string } => {
                if (!dateTimeStr) return { date: '', time: '' };

                try {
                    // Check if it's already in ISO format or has both date and time
                    if (dateTimeStr.includes('T')) {
                        const dt = new Date(dateTimeStr);
                        if (!isNaN(dt.getTime())) {
                            return {
                                date: dt.toISOString().slice(0, 10),
                                time: dt.toISOString().slice(11, 16),
                            };
                        }
                    }

                    // Check if it's a date-only string (YYYY-MM-DD)
                    if (/^\d{4}-\d{2}-\d{2}$/.test(dateTimeStr)) {
                        return { date: dateTimeStr, time: '' };
                    }

                    // Check if it's a time-only string (HH:mm or HH:mm:ss)
                    if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateTimeStr)) {
                        return { date: '', time: dateTimeStr.slice(0, 5) };
                    }

                    // Try parsing as a full date string
                    const dt = new Date(dateTimeStr);
                    if (!isNaN(dt.getTime())) {
                        return {
                            date: dt.toISOString().slice(0, 10),
                            time: dt.toISOString().slice(11, 16),
                        };
                    }
                } catch {
                    // Parsing failed, return empty values
                }

                return { date: '', time: '' };
            };

            const parseTimeOnly = (timeStr: string | null | undefined): string => {
                if (!timeStr) return '';

                // If it's already HH:mm or HH:mm:ss format
                if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
                    return timeStr.slice(0, 5);
                }

                // Try to parse as a full datetime
                try {
                    const dt = new Date(timeStr);
                    if (!isNaN(dt.getTime())) {
                        return dt.toISOString().slice(11, 16);
                    }
                } catch {
                    // Ignore parsing errors
                }

                return timeStr.slice(0, 5);
            };

            const departureParsed = parseDateTime(service.departure_time);

            setFormData({
                name: service.name || '',
                contact: service.contact || '',
                start_location: service.start_location || '',
                start_place_id: service.start_place_id || null,
                start_latitude: service.start_latitude ? Number(service.start_latitude) : null,
                start_longitude: service.start_longitude ? Number(service.start_longitude) : null,
                end_location: service.end_location || '',
                end_place_id: service.end_place_id || null,
                end_latitude: service.end_latitude ? Number(service.end_latitude) : null,
                end_longitude: service.end_longitude ? Number(service.end_longitude) : null,
                departure_date: departureParsed.date,
                departure_time: departureParsed.time,
                schedule_type: service.schedule_type || (service.is_everyday ? 'everyday' : 'once'),
                selected_days: service.selected_days || [],
                is_roundtrip: service.is_roundtrip || false,
                return_time: parseTimeOnly(service.return_time),
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

            if (service.stops && Array.isArray(service.stops)) {
                interface StopData {
                    location?: string;
                    place_id?: string | null;
                    latitude?: number | null;
                    longitude?: number | null;
                    raw_stop_time?: string;
                    stop_time?: string;
                    order?: number;
                    notes?: string;
                }
                setStops(
                    service.stops.map((stop: StopData) => {
                        const stopParsed = parseDateTime(stop.raw_stop_time ?? stop.stop_time);
                        return {
                            location: stop.location || '',
                            place_id: stop.place_id || null,
                            latitude: stop.latitude ? Number(stop.latitude) : null,
                            longitude: stop.longitude ? Number(stop.longitude) : null,
                            stop_date: stopParsed.date || departureParsed.date,
                            stop_time: stopParsed.time,
                            order: stop.order || 0,
                            notes: stop.notes || '',
                        };
                    }),
                );
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
            const { departure_date, ...restFormData } = formData;

            const payload = {
                ...restFormData,
                start_location: formData.start_location,
                end_location: formData.end_location,
                ...(formData.schedule_type === 'once' ? { departure_date } : {}),
                departure_time: formData.departure_time,
                schedule_type: formData.schedule_type,
                selected_days: formData.schedule_type === 'custom' ? formData.selected_days : null,
                is_roundtrip: formData.is_roundtrip,
                return_time: formData.is_roundtrip && formData.return_time ? formData.return_time : null,
                is_everyday: formData.schedule_type === 'everyday', // Keep for backward compatibility if needed
                available_spaces: parseInt(formData.available_spaces.toString()),
                car_seats: formData.car_seats ? parseInt(formData.car_seats) : null,
                price_per_person: formData.price_per_person ? parseInt(formData.price_per_person) : null,
                stops: stops.map((stop, index) => {
                    return {
                        location: stop.location || null,
                        place_id: stop.place_id || null,
                        latitude: stop.latitude ?? null,
                        longitude: stop.longitude ?? null,
                        stop_time:
                            formData.schedule_type === 'once' && stop.stop_date && stop.stop_time
                                ? `${stop.stop_date}T${stop.stop_time}:00`
                                : formData.schedule_type !== 'once' && stop.stop_time
                                  ? `2000-01-01T${stop.stop_time}:00` // Use a placeholder date for recurring services
                                  : stop.stop_time,
                        order: stop.order || index,
                        notes: stop.notes || null,
                    };
                }),
            };

            const url = isEditing ? `/api/customer/pick-and-drop/${id}` : '/api/customer/pick-and-drop';
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

    const addStop = () => {
        setStops([
            ...stops,
            {
                location: '',
                place_id: null,
                latitude: null,
                longitude: null,
                stop_date: formData.schedule_type === 'once' ? formData.departure_date || '' : '', // Default to departure date if once
                stop_time: '',
                order: stops.length,
                notes: '',
            },
        ]);
    };

    const removeStop = (index: number) => {
        setStops(stops.filter((_, i) => i !== index));
    };

    const updateStop = (index: number, field: keyof Stop, value: string | number | undefined) => {
        const newStops = [...stops];
        newStops[index] = { ...newStops[index], [field]: value };
        setStops(newStops);
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="mb-6 text-3xl font-bold text-[#7e246c] dark:text-white">{isEditing ? 'Edit' : 'Create'} Ride</h1>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Route Information */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[#7e246c] dark:text-white">
                        <MapPin className="h-5 w-5" />
                        Route Information
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Start Location *</label>
                            <GooglePlacesInput
                                value={formData.start_location}
                                required
                                placeholder="Search start location"
                                onChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        start_location: value,
                                        start_place_id: null,
                                        start_latitude: null,
                                        start_longitude: null,
                                    }))
                                }
                                onPlaceSelected={(place) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        start_location: place.address,
                                        start_place_id: place.placeId,
                                        start_latitude: place.latitude,
                                        start_longitude: place.longitude,
                                    }))
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">End Location *</label>
                            <GooglePlacesInput
                                value={formData.end_location}
                                required
                                placeholder="Search end location"
                                onChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        end_location: value,
                                        end_place_id: null,
                                        end_latitude: null,
                                        end_longitude: null,
                                    }))
                                }
                                onPlaceSelected={(place) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        end_location: place.address,
                                        end_place_id: place.placeId,
                                        end_latitude: place.latitude,
                                        end_longitude: place.longitude,
                                    }))
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="space-y-4 md:col-span-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Schedule Type</label>
                                <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                                    {[
                                        { id: 'once', label: 'One-time' },
                                        { id: 'everyday', label: 'Everyday' },
                                        { id: 'weekdays', label: 'Weekdays' },
                                        { id: 'weekends', label: 'Weekends' },
                                        { id: 'custom', label: 'Custom' },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, schedule_type: type.id });
                                                if (type.id !== 'once') {
                                                    setFormData((prev) => ({ ...prev, departure_date: '' }));
                                                    // Clear stop dates for recurring
                                                    setStops(stops.map((stop) => ({ ...stop, stop_date: '' })));
                                                }
                                            }}
                                            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                                                formData.schedule_type === type.id
                                                    ? 'border-[#7e246c] bg-[#7e246c] text-white'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.schedule_type === 'custom' && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Select Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => {
                                                    const currentDays = formData.selected_days || [];
                                                    const newDays = currentDays.includes(day)
                                                        ? currentDays.filter((d) => d !== day)
                                                        : [...currentDays, day];
                                                    setFormData({ ...formData, selected_days: newDays });
                                                }}
                                                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                                                    formData.selected_days?.includes(day)
                                                        ? 'border-[#7e246c] bg-[#7e246c] text-white'
                                                        : 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
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
                                    className="h-4 w-4 rounded border-gray-300 text-[#7e246c] focus:ring-[#7e246c]"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Round Trip (Return on the same day/schedule)
                                </span>
                            </div>
                        </div>
                        {formData.schedule_type === 'once' && (
                            <div>
                                <label className="mb-1 block flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                        setStops(stops.map((stop) => ({ ...stop, stop_date: newDate })));
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        )}
                        <div className="col-span-1 grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Calendar className="h-4 w-4" />
                                    Departure Time *
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.departure_time}
                                    onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {formData.is_roundtrip && (
                                <div>
                                    <label className="mb-1 block flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <Calendar className="h-4 w-4" />
                                        Return Time *
                                    </label>
                                    <input
                                        type="time"
                                        required={formData.is_roundtrip}
                                        value={formData.return_time}
                                        onChange={(e) => setFormData({ ...formData, return_time: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[#7e246c] dark:text-white">
                        <Users className="h-5 w-5" />
                        Contact Information (Optional)
                    </h2>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        If provided, these will be used as contact information. Otherwise, your account information will be used.
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter contact name (optional)"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</label>
                            <input
                                type="text"
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                placeholder="Enter contact number (optional)"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Service Details */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[#7e246c] dark:text-white">
                        <Users className="h-5 w-5" />
                        Service Details
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Available Spaces *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.available_spaces}
                                onChange={(e) => setFormData({ ...formData, available_spaces: parseInt(e.target.value) || 1 })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Driver Gender *</label>
                            <select
                                required
                                value={formData.driver_gender}
                                onChange={(e) => setFormData({ ...formData, driver_gender: e.target.value as 'male' | 'female' })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Price Per Person</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price_per_person}
                                    onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="PKR">PKR</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="h-5 w-5 rounded text-[#7e246c] focus:ring-[#7e246c]"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Car Details */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="mb-4 text-xl font-semibold text-[#7e246c] dark:text-white">Car Details (Optional)</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Car Brand</label>
                            <input
                                type="text"
                                value={formData.car_brand}
                                onChange={(e) => setFormData({ ...formData, car_brand: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Car Model</label>
                            <input
                                type="text"
                                value={formData.car_model}
                                onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Car Color</label>
                            <input
                                type="text"
                                value={formData.car_color}
                                onChange={(e) => setFormData({ ...formData, car_color: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Seats</label>
                            <input
                                type="number"
                                value={formData.car_seats}
                                onChange={(e) => setFormData({ ...formData, car_seats: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Transmission</label>
                            <select
                                value={formData.car_transmission}
                                onChange={(e) => setFormData({ ...formData, car_transmission: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Select</option>
                                <option value="manual">Manual</option>
                                <option value="automatic">Automatic</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Fuel Type</label>
                            <select
                                value={formData.car_fuel_type}
                                onChange={(e) => setFormData({ ...formData, car_fuel_type: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-[#7e246c] dark:text-white">Stops (Optional)</h2>
                        <button
                            type="button"
                            onClick={addStop}
                            className="flex items-center gap-2 rounded-lg bg-[#7e246c] px-4 py-2 text-white transition-colors hover:bg-[#6a1f5c]"
                        >
                            <Plus className="h-4 w-4" />
                            Add Stop
                        </button>
                    </div>
                    {stops.map((stop, index) => (
                        <div key={index} className="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="font-medium text-gray-700 dark:text-gray-300">Stop {index + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => removeStop(index)}
                                    className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Stop Location *</label>
                                    <GooglePlacesInput
                                        value={stop.location || ''}
                                        required
                                        placeholder="Search stop location"
                                        onChange={(location) => {
                                            const newStops = [...stops];
                                            newStops[index] = {
                                                ...newStops[index],
                                                location,
                                                place_id: null,
                                                latitude: null,
                                                longitude: null,
                                            };
                                            setStops(newStops);
                                        }}
                                        onPlaceSelected={(place) => {
                                            const newStops = [...stops];
                                            newStops[index] = {
                                                ...newStops[index],
                                                location: place.address,
                                                place_id: place.placeId,
                                                latitude: place.latitude,
                                                longitude: place.longitude,
                                            };
                                            setStops(newStops);
                                        }}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                {formData.schedule_type === 'once' && (
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Stop Date *</label>
                                        <input
                                            type="date"
                                            required={formData.schedule_type === 'once'}
                                            value={stop.stop_date}
                                            onChange={(e) => updateStop(index, 'stop_date', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Stop Time *</label>
                                    <input
                                        type="time"
                                        required
                                        value={stop.stop_time}
                                        onChange={(e) => updateStop(index, 'stop_time', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                                    <textarea
                                        value={stop.notes}
                                        onChange={(e) => updateStop(index, 'notes', e.target.value)}
                                        rows={2}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                        className="flex items-center gap-2 rounded-lg bg-[#7e246c] px-6 py-3 text-white transition-colors hover:bg-[#6a1f5c] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Save className="h-5 w-5" />
                        {loading ? 'Saving...' : isEditing ? 'Update Service' : 'Create Service'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/pick-and-drop')}
                        className="rounded-lg bg-gray-200 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
