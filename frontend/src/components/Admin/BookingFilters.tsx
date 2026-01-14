import { useState, useEffect } from 'react';
import type { Location } from '../../types';
import { BookingMode, BookingState } from '../../types';
import { locationsAPI } from '../../api/client';

interface BookingFiltersProps {
  onFilterChange: (filters: {
    location_id?: string;
    mode?: string;
    start_date?: string;
    end_date?: string;
    state?: string;
  }) => void;
}

const MODE_LABELS: Record<BookingMode, string> = {
  [BookingMode.HANDLEDNING]: 'Handledning',
  [BookingMode.RUM]: 'Rum',
  [BookingMode.STUDIEBESOK]: 'Studiebesök',
  [BookingMode.GRUPP]: 'Grupp',
  [BookingMode.INDIVIDUELL]: 'Individuell',
};

export default function BookingFilters({ onFilterChange }: BookingFiltersProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filters, setFilters] = useState({
    location_id: '',
    mode: '',
    start_date: '',
    end_date: '',
    state: '',
  });

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    // Clean up empty filters before sending
    const cleanFilters: any = {};
    if (filters.location_id) cleanFilters.location_id = filters.location_id;
    if (filters.mode) cleanFilters.mode = filters.mode;
    if (filters.start_date) cleanFilters.start_date = filters.start_date;
    if (filters.end_date) cleanFilters.end_date = filters.end_date;
    if (filters.state) cleanFilters.state = filters.state;

    onFilterChange(cleanFilters);
  }, [filters]);

  async function loadLocations() {
    try {
      const response: any = await locationsAPI.getAll();
      setLocations(response.locations);
    } catch (err: any) {
      console.error('Failed to load locations:', err);
    }
  }

  function handleReset() {
    setFilters({
      location_id: '',
      mode: '',
      start_date: '',
      end_date: '',
      state: '',
    });
  }

  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Filtrera bokningar</h3>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Återställ
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Plats</label>
          <select
            value={filters.location_id}
            onChange={(e) => setFilters({ ...filters, location_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Alla</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Bokningssätt</label>
          <select
            value={filters.mode}
            onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Alla</option>
            {Object.entries(MODE_LABELS).map(([mode, label]) => (
              <option key={mode} value={mode}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Från datum</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Till datum</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Alla</option>
            <option value={BookingState.CONFIRMED}>Bekräftad</option>
            <option value={BookingState.PENDING}>Väntande</option>
            <option value={BookingState.CANCELLED}>Avbokad</option>
          </select>
        </div>
      </div>
    </div>
  );
}
