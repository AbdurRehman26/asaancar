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
    const fieldClassName =
        'h-11 w-full rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] px-3 py-2 text-[#2b1128] placeholder:text-[#a18ba0] focus:border-[#7e246c]/30 focus:bg-white focus:ring-2 focus:ring-[#7e246c]/10 focus:outline-none dark:border-white/10 dark:bg-white/6 dark:text-white dark:placeholder:text-white/35 dark:focus:bg-white/8 dark:focus:ring-white/10';
    const labelClassName = 'mb-1.5 block text-sm font-semibold text-[#6b5368] dark:text-white/75';

    return (
        <div
            className={`${filterClass} relative mx-0 rounded-[1.5rem] border border-[#7e246c]/10 bg-[#fffafc] p-5 shadow-[0_16px_38px_-30px_rgba(126,36,108,0.2)] md:p-6 dark:border-white/10 dark:bg-white/4`}
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div>
                    <label className={labelClassName}>Start Location</label>
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
                        className={fieldClassName}
                    />
                </div>
                <div>
                    <label className={labelClassName}>End Location</label>
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
                        className={fieldClassName}
                    />
                </div>
                <div>
                    <label className={labelClassName}>Driver Gender</label>
                    <div className="relative">
                        <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#aa92a7] dark:text-white/35" />
                        <select
                            value={filters.driver_gender}
                            onChange={(e) => setFilters({ ...filters, driver_gender: e.target.value })}
                            className={`${fieldClassName} pl-10`}
                        >
                            <option value="">Any</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className={labelClassName}>Departure Date</label>
                    <div className="relative">
                        <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#aa92a7] dark:text-white/35" />
                        <input
                            type="date"
                            value={filters.departure_date}
                            onChange={(e) => setFilters({ ...filters, departure_date: e.target.value })}
                            className={`${fieldClassName} pl-10`}
                        />
                    </div>
                </div>
                <div>
                    <label className={labelClassName}>Departure Time</label>
                    <div className="relative">
                        <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#aa92a7] dark:text-white/35" />
                        <input
                            type="time"
                            value={filters.departure_time}
                            onChange={(e) => setFilters({ ...filters, departure_time: e.target.value })}
                            className={`${fieldClassName} pl-10`}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleSearch}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#7e246c] px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-[#6a1f5c] hover:shadow-[0_18px_30px_-18px_rgba(126,36,108,0.7)] md:w-auto"
                >
                    <Search className="h-5 w-5" />
                    Search rides
                </button>
            </div>
        </div>
    );
};

export default PickAndDropFilter;
