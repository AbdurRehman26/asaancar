import { useAuth } from '@/components/AuthContext';
import GooglePlacesInput from '@/components/GooglePlacesInput';
import { apiFetch } from '@/lib/utils';
import { Calendar, MapPin, Save, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function RideRequestForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEditing = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
        schedule_type: 'once',
        selected_days: [] as string[],
        is_roundtrip: false,
        return_time: '',
        required_seats: 1,
        preferred_driver_gender: 'any' as 'male' | 'female' | 'any',
        budget_per_seat: '',
        currency: 'PKR',
        description: '',
        is_active: true,
    });

    const parseDateTime = (value: string | null | undefined): { date: string; time: string } => {
        if (!value) {
            return { date: '', time: '' };
        }

        if (value.includes('T')) {
            const parsed = new Date(value);

            if (!Number.isNaN(parsed.getTime())) {
                return {
                    date: parsed.toISOString().slice(0, 10),
                    time: parsed.toISOString().slice(11, 16),
                };
            }
        }

        if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
            return {
                date: value.slice(0, 10),
                time: value.slice(11, 16),
            };
        }

        return { date: '', time: value.slice(0, 5) };
    };

    const fetchRequest = useCallback(async () => {
        try {
            const response = await apiFetch(`/api/ride-requests/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch ride request');
            }

            const data = await response.json();
            const request = data.data || data;
            const departure = parseDateTime(request.departure_time);

            setFormData({
                name: request.name || '',
                contact: request.contact || '',
                start_location: request.start_location || '',
                start_place_id: request.start_place_id || null,
                start_latitude: request.start_latitude ? Number(request.start_latitude) : null,
                start_longitude: request.start_longitude ? Number(request.start_longitude) : null,
                end_location: request.end_location || '',
                end_place_id: request.end_place_id || null,
                end_latitude: request.end_latitude ? Number(request.end_latitude) : null,
                end_longitude: request.end_longitude ? Number(request.end_longitude) : null,
                departure_date: departure.date,
                departure_time: departure.time,
                schedule_type: request.schedule_type || 'once',
                selected_days: Array.isArray(request.selected_days) ? request.selected_days : [],
                is_roundtrip: request.is_roundtrip || false,
                return_time: request.return_time?.slice(0, 5) || '',
                required_seats: request.required_seats || 1,
                preferred_driver_gender: request.preferred_driver_gender || 'any',
                budget_per_seat: request.budget_per_seat?.toString() || '',
                currency: request.currency || 'PKR',
                description: request.description || '',
                is_active: request.is_active ?? true,
            });
        } catch (fetchError) {
            setError(fetchError instanceof Error ? fetchError.message : 'Failed to load ride request');
        }
    }, [id]);

    useEffect(() => {
        if (isEditing && id) {
            void fetchRequest();
        }
    }, [fetchRequest, id, isEditing]);

    useEffect(() => {
        if (!isEditing && user?.phone_number && !formData.contact) {
            setFormData((current) => ({
                ...current,
                contact: user.phone_number,
            }));
        }
    }, [formData.contact, isEditing, user?.phone_number]);

    useEffect(() => {
        if (!isEditing && user?.name && !formData.name) {
            setFormData((current) => ({
                ...current,
                name: user.name,
            }));
        }
    }, [formData.name, isEditing, user?.name]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { departure_date, ...restFormData } = formData;

            const payload = {
                ...restFormData,
                ...(formData.schedule_type === 'once' ? { departure_date } : {}),
                selected_days: formData.schedule_type === 'custom' ? formData.selected_days : null,
                return_time: formData.is_roundtrip && formData.return_time ? formData.return_time : null,
                required_seats: Number(formData.required_seats),
                budget_per_seat: formData.budget_per_seat ? Number(formData.budget_per_seat) : null,
            };

            const response = await apiFetch(isEditing ? `/api/customer/ride-requests/${id}` : '/api/customer/ride-requests', {
                method: isEditing ? 'PUT' : 'POST',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const responseData = await response.json().catch(() => ({}));
                throw new Error(responseData.message || 'Failed to save ride request');
            }

            navigate('/dashboard/ride-requests');
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Failed to save ride request');
        } finally {
            setLoading(false);
        }
    };

    const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="mb-6 text-3xl font-bold text-[#7e246c] dark:text-white">{isEditing ? 'Edit' : 'Create'} Ride Request</h1>

            {error ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                                    setFormData((current) => ({
                                        ...current,
                                        start_location: value,
                                        start_place_id: null,
                                        start_latitude: null,
                                        start_longitude: null,
                                    }))
                                }
                                onPlaceSelected={(place) =>
                                    setFormData((current) => ({
                                        ...current,
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
                                    setFormData((current) => ({
                                        ...current,
                                        end_location: value,
                                        end_place_id: null,
                                        end_latitude: null,
                                        end_longitude: null,
                                    }))
                                }
                                onPlaceSelected={(place) =>
                                    setFormData((current) => ({
                                        ...current,
                                        end_location: place.address,
                                        end_place_id: place.placeId,
                                        end_latitude: place.latitude,
                                        end_longitude: place.longitude,
                                    }))
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[#7e246c] dark:text-white">
                        <Calendar className="h-5 w-5" />
                        Schedule
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Schedule Type *</label>
                            <select
                                value={formData.schedule_type}
                                onChange={(event) => setFormData((current) => ({ ...current, schedule_type: event.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="once">Once</option>
                                <option value="everyday">Everyday</option>
                                <option value="weekdays">Weekdays</option>
                                <option value="weekends">Weekends</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                        {formData.schedule_type === 'once' ? (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Departure Date *</label>
                                <input
                                    type="date"
                                    value={formData.departure_date}
                                    onChange={(event) => setFormData((current) => ({ ...current, departure_date: event.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        ) : null}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Departure Time *</label>
                            <input
                                type="time"
                                value={formData.departure_time}
                                onChange={(event) => setFormData((current) => ({ ...current, departure_time: event.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Return Trip</label>
                            <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600">
                                <input
                                    id="ride-request-roundtrip"
                                    type="checkbox"
                                    checked={formData.is_roundtrip}
                                    onChange={(event) => setFormData((current) => ({ ...current, is_roundtrip: event.target.checked }))}
                                />
                                <label htmlFor="ride-request-roundtrip" className="text-sm text-gray-700 dark:text-gray-300">
                                    Include return timing
                                </label>
                            </div>
                        </div>
                        {formData.is_roundtrip ? (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Return Time</label>
                                <input
                                    type="time"
                                    value={formData.return_time}
                                    onChange={(event) => setFormData((current) => ({ ...current, return_time: event.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        ) : null}
                    </div>

                    {formData.schedule_type === 'custom' ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {dayOptions.map((day) => {
                                const selected = formData.selected_days.includes(day);

                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() =>
                                            setFormData((current) => ({
                                                ...current,
                                                selected_days: selected
                                                    ? current.selected_days.filter((selectedDay) => selectedDay !== day)
                                                    : [...current.selected_days, day],
                                            }))
                                        }
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                            selected ? 'bg-[#7e246c] text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                                        }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[#7e246c] dark:text-white">
                        <Users className="h-5 w-5" />
                        Request Preferences
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-500 dark:border-gray-600 dark:bg-gray-700/70 dark:text-gray-300"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Contact</label>
                            <input
                                type="text"
                                value={formData.contact}
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-500 dark:border-gray-600 dark:bg-gray-700/70 dark:text-gray-300"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Seats Needed *</label>
                            <input
                                type="number"
                                min={1}
                                max={4}
                                value={formData.required_seats}
                                onChange={(event) => setFormData((current) => ({ ...current, required_seats: Number(event.target.value) }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Driver Gender *</label>
                            <select
                                value={formData.preferred_driver_gender}
                                onChange={(event) =>
                                    setFormData((current) => ({
                                        ...current,
                                        preferred_driver_gender: event.target.value as 'male' | 'female' | 'any',
                                    }))
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="any">Any</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Budget Per Seat</label>
                            <input
                                type="number"
                                min={0}
                                value={formData.budget_per_seat}
                                onChange={(event) => setFormData((current) => ({ ...current, budget_per_seat: event.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                            <input
                                type="text"
                                value={formData.currency}
                                onChange={(event) => setFormData((current) => ({ ...current, currency: event.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/ride-requests')}
                        className="rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg bg-[#7e246c] px-5 py-2 font-medium text-white transition-colors hover:bg-[#6a1f5c] disabled:opacity-70"
                    >
                        <Save className="h-4 w-4" />
                        {loading ? 'Saving...' : 'Save Ride Request'}
                    </button>
                </div>
            </form>
        </div>
    );
}
