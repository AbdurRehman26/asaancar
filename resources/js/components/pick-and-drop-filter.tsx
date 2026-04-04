import GooglePlacesInput from '@/components/GooglePlacesInput';
import { Calendar, Clock, Search, User } from 'lucide-react';
import React, { useState } from 'react';

export type PickAndDropFiltersType = {
    start_location: string;
    start_latitude: string;
    start_longitude: string;
    end_location: string;
    end_latitude: string;
    end_longitude: string;
    driver_gender: string;
    departure_date: string;
    departure_time: string;
};

interface PickAndDropFilterProps {
    onSearch: (filters: PickAndDropFiltersType) => void;
    className?: string;
    fullWidth?: boolean;
}
const PickAndDropFilter: React.FC<PickAndDropFilterProps> = ({ onSearch, className = '', fullWidth = false }) => {
    const [filters, setFilters] = useState<PickAndDropFiltersType>({
        start_location: '',
        start_latitude: '',
        start_longitude: '',
        end_location: '',
        end_latitude: '',
        end_longitude: '',
        driver_gender: '',
        departure_date: '',
        departure_time: '',
    });

    const handleSearch = () => {
        onSearch(filters);
    };

    const filterClass = fullWidth ? 'w-full max-w-none' : className;

    return (
        <div className={`${filterClass} relative mx-0 my-4 rounded-lg border-2 border-[#7e246c] bg-white p-4 shadow-lg md:p-6 dark:bg-gray-800/80`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div>
                    <label className="mb-1 block text-sm font-bold text-[#7e246c] dark:text-white">Start Location</label>
                    <GooglePlacesInput
                        value={filters.start_location}
                        placeholder="Search start location"
                        onChange={(value) =>
                            setFilters({
                                ...filters,
                                start_location: value,
                                start_latitude: '',
                                start_longitude: '',
                            })
                        }
                        onPlaceSelected={(place) =>
                            setFilters({
                                ...filters,
                                start_location: place.address,
                                start_latitude: place.latitude?.toString() ?? '',
                                start_longitude: place.longitude?.toString() ?? '',
                            })
                        }
                        className="w-full rounded-md border border-[#7e246c] bg-gray-100 px-3 py-2 text-black placeholder-gray-500 focus:ring-2 focus:ring-[#7e246c] focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-bold text-[#7e246c] dark:text-white">End Location</label>
                    <GooglePlacesInput
                        value={filters.end_location}
                        placeholder="Search end location"
                        onChange={(value) =>
                            setFilters({
                                ...filters,
                                end_location: value,
                                end_latitude: '',
                                end_longitude: '',
                            })
                        }
                        onPlaceSelected={(place) =>
                            setFilters({
                                ...filters,
                                end_location: place.address,
                                end_latitude: place.latitude?.toString() ?? '',
                                end_longitude: place.longitude?.toString() ?? '',
                            })
                        }
                        className="w-full rounded-md border border-[#7e246c] bg-gray-100 px-3 py-2 text-black placeholder-gray-500 focus:ring-2 focus:ring-[#7e246c] focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-bold text-[#7e246c] dark:text-white">Driver Gender</label>
                    <div className="relative">
                        <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select
                            value={filters.driver_gender}
                            onChange={(e) => setFilters({ ...filters, driver_gender: e.target.value })}
                            className="w-full rounded-md border border-[#7e246c] bg-gray-100 px-3 py-2 pl-10 text-black focus:ring-2 focus:ring-[#7e246c] focus:outline-none dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Any</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-bold text-[#7e246c] dark:text-white">Departure Date</label>
                    <div className="relative">
                        <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="date"
                            value={filters.departure_date}
                            onChange={(e) => setFilters({ ...filters, departure_date: e.target.value })}
                            className="w-full rounded-md border border-[#7e246c] bg-gray-100 px-3 py-2 pl-10 text-black focus:ring-2 focus:ring-[#7e246c] focus:outline-none dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-bold text-[#7e246c] dark:text-white">Departure Time</label>
                    <div className="relative">
                        <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="time"
                            value={filters.departure_time}
                            onChange={(e) => setFilters({ ...filters, departure_time: e.target.value })}
                            className="w-full rounded-md border border-[#7e246c] bg-gray-100 px-3 py-2 pl-10 text-black focus:ring-2 focus:ring-[#7e246c] focus:outline-none dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleSearch}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#7e246c] px-8 py-3 font-bold text-white transition-all hover:bg-[#6a1f5c] hover:shadow-lg md:w-auto"
                >
                    <Search className="h-5 w-5" />
                    Search Pick & Drop
                </button>
            </div>
        </div>
    );
};

export default PickAndDropFilter;
