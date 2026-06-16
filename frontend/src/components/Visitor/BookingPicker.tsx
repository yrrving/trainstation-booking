import { useState, useEffect } from 'react';
import type { BookingOption, Location } from '../../types';
import { BookingMode } from '../../types';
import { locationsAPI, bookingOptionsAPI } from '../../api/client';

interface BookingPickerProps {
  locationId: string;
  onSelectOption: (option: BookingOption) => void;
  onSendWish: (mode: BookingMode, modeLabel: string) => void;
}

const MODE_LABELS: Record<BookingMode, string> = {
  [BookingMode.HANDLEDNING]: 'Handledning med personal',
  [BookingMode.RUM]: 'Boka rum (studio)',
  [BookingMode.STUDIEBESOK]: 'Studiebesök',
  [BookingMode.GRUPP]: 'Grupp (skolklass/fritidsgård)',
  [BookingMode.INDIVIDUELL]: 'Individuell (självgående)',
};

export default function BookingPicker({ locationId, onSelectOption, onSendWish }: BookingPickerProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [selectedMode, setSelectedMode] = useState<BookingMode | ''>('');
  const [options, setOptions] = useState<BookingOption[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState('');

  // Load the location to know which modes are enabled
  useEffect(() => {
    let active = true;
    setLoadingLocation(true);
    locationsAPI
      .getById(locationId)
      .then((res: any) => {
        if (!active) return;
        setLocation(res.location);
        // Auto-select the first mode so the panel is never empty
        if (res.location?.enabled_modes?.length) {
          setSelectedMode(res.location.enabled_modes[0]);
        }
      })
      .catch((err: any) => active && setError(err.message))
      .finally(() => active && setLoadingLocation(false));
    return () => {
      active = false;
    };
  }, [locationId]);

  // Load options dynamically whenever the selected mode changes
  useEffect(() => {
    if (!selectedMode) {
      setOptions([]);
      return;
    }
    let active = true;
    setLoadingOptions(true);
    bookingOptionsAPI
      .getAll({ location_id: locationId, mode: selectedMode, is_active: true })
      .then((res: any) => active && setOptions(res.options))
      .catch((err: any) => active && setError(err.message))
      .finally(() => active && setLoadingOptions(false));
    return () => {
      active = false;
    };
  }, [locationId, selectedMode]);

  if (loadingLocation) {
    return <div className="text-center py-8 text-gray-300">Laddar bokningssätt...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-8">Fel: {error}</div>;
  }

  if (!location) {
    return <div className="text-center py-8 text-gray-300">Plats hittades inte</div>;
  }

  const modeLabel = selectedMode ? MODE_LABELS[selectedMode] : '';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-100">Vad vill du boka?</h2>
        <p className="text-sm text-gray-400 mt-1">{location.name}</p>
      </div>

      {/* Dropdown: typ av bokning */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Typ av bokning</label>
        <select
          value={selectedMode}
          onChange={(e) => setSelectedMode(e.target.value as BookingMode)}
          className="w-full px-3 py-3 border border-gray-600 bg-gray-800 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {location.enabled_modes.map((mode) => (
            <option key={mode} value={mode}>
              {MODE_LABELS[mode]}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamisk panel: alternativ laddas in under utan vybyte */}
      <div className="space-y-3">
        {loadingOptions ? (
          <div className="text-center py-8 text-gray-400">Laddar alternativ...</div>
        ) : options.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center space-y-3">
            <p className="text-gray-400">
              Inga bokningsbara alternativ för <span className="text-gray-200">{modeLabel}</span> just nu.
            </p>
            {selectedMode && (
              <button
                onClick={() => onSendWish(selectedMode, modeLabel)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
              >
                Skicka önskemål istället
              </button>
            )}
          </div>
        ) : (
          options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelectOption(option)}
              className="w-full p-6 bg-gray-800 border-2 border-gray-700 rounded-lg hover:border-blue-500 hover:shadow-lg transition text-left"
            >
              <h3 className="font-semibold text-lg text-gray-100">{option.label}</h3>
              <p className="text-gray-400 mt-2">{option.description}</p>
              <div className="mt-3 flex gap-4 text-sm text-gray-500">
                <span>⏱️ {option.duration_minutes} min</span>
                <span>👥 Max {option.capacity.max_people} personer</span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Reaktiv väg: alltid en utväg så det aldrig blir en dead end */}
      {selectedMode && options.length > 0 && (
        <div className="border-t border-gray-700 pt-4 text-center">
          <p className="text-sm text-gray-400 mb-2">Hittar du ingen tid som passar?</p>
          <button
            onClick={() => onSendWish(selectedMode, modeLabel)}
            className="text-blue-400 hover:text-blue-300 font-medium text-sm"
          >
            Skicka önskemål om annan tid →
          </button>
        </div>
      )}
    </div>
  );
}
