"use client"

import { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileContextType {
  profileType: 'artist' | 'venue' | 'industry' | null;
  setProfileType: (type: 'artist' | 'venue' | 'industry' | null) => void;
  profileComplete: boolean;
  setProfileComplete: (complete: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profileType, setProfileType] = useState<'artist' | 'venue' | 'industry' | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);

  return (
    <ProfileContext.Provider
      value={{
        profileType,
        setProfileType,
        profileComplete,
        setProfileComplete,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
} 