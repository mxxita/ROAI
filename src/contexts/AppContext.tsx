import React, { createContext, useContext, useState } from 'react';
import { EventLog, ProcessModel, User, GlobalStats, CaseConformance } from '@/types';

interface AppContextType {
  eventLog: EventLog | null;
  processModel: ProcessModel | null;
  users: User[];
  globalStats: GlobalStats | null;
  conformance: CaseConformance[];
  setEventLog: (log: EventLog) => void;
  setProcessModel: (model: ProcessModel) => void;
  setUsers: (users: User[]) => void;
  setGlobalStats: (stats: GlobalStats) => void;
  setConformance: (conformance: CaseConformance[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [eventLog, setEventLog] = useState<EventLog | null>(null);
  const [processModel, setProcessModel] = useState<ProcessModel | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [conformance, setConformance] = useState<CaseConformance[]>([]);

  return (
    <AppContext.Provider
      value={{
        eventLog,
        processModel,
        users,
        globalStats,
        conformance,
        setEventLog,
        setProcessModel,
        setUsers,
        setGlobalStats,
        setConformance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
