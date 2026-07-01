import { createContext, useContext } from 'react';

interface SessionContextType {
  selectedLocationId: string | null;
  setSelectedLocation: (locationId: string) => Promise<void>;
  clearSelectedLocation: () => void;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
