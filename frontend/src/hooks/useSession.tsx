import { createContext, useContext, useState, ReactNode } from 'react';
import { sessionAPI } from '../api/client';

interface SessionContextType {
  selectedLocationId: string | null;
  setSelectedLocation: (locationId: string) => Promise<void>;
  clearSelectedLocation: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

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

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
