import { useState, useEffect } from 'react';
import type { Location } from '../../types';
import { locationsAPI } from '../../api/client';
import { useSession } from '../../hooks/useSession';

export default function LocationSelector() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { setSelectedLocation } = useSession();

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

  async function handleSelectLocation(locationId: string) {
    try {
      await setSelectedLocation(locationId);
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Laddar platser...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">Fel: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Välj plats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => handleSelectLocation(location.id)}
            className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition text-left"
          >
            <h3 className="font-semibold text-lg">{location.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {location.enabled_modes.length} bokningssätt tillgängliga
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
