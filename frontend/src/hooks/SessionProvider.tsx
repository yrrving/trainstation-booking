import { useState, type ReactNode } from 'react';
import { sessionAPI } from '../api/client';
import { SessionContext } from './useSession';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  async function setSelectedLocation(locationId: string) {
    await sessionAPI.setLocation(locationId);
    setSelectedLocationId(locationId);
  }

  async function clearSelectedLocation() {
    setSelectedLocationId(null);
  }

  return (
    <SessionContext.Provider
      value={{
        selectedLocationId,
        setSelectedLocation,
        clearSelectedLocation,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
