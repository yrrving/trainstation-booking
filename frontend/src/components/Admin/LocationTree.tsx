import { useState, useEffect } from 'react';
import type { Location } from '../../types';
import { locationsAPI } from '../../api/client';

interface LocationTreeProps {
  onSelectLocation: (location: Location) => void;
  selectedLocationId?: string;
}

export default function LocationTree({ onSelectLocation, selectedLocationId }: LocationTreeProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  async function loadLocations() {
    try {
      const response: any = await locationsAPI.getAll();
      setLocations(response.locations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Laddar platser...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">Fel: {error}</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-gray-700 mb-3">Platser</h3>
      {locations.map((location) => (
        <button
          key={location.id}
          onClick={() => onSelectLocation(location)}
          className={`w-full text-left px-4 py-2 rounded-md transition ${
            selectedLocationId === location.id
              ? 'bg-blue-100 text-blue-900 font-medium'
              : 'bg-white hover:bg-gray-50 text-gray-700'
          }`}
        >
          {location.name}
        </button>
      ))}
    </div>
  );
}
