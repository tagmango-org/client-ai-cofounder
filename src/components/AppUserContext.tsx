import { User } from '@/types/dataService';
import { createContext, useContext } from 'react';

interface AppUserContextType {
    currentAppUser: User | null;
    setCurrentAppUser: (user: any) => void;
    appUserLoading: boolean;
    tagMangoUser: any;
    setTagMangoUser: (user: any) => void;
}

export const AppUserContext = createContext<AppUserContextType>({
    currentAppUser: null,
    setCurrentAppUser: () => {},
    appUserLoading: true,
    tagMangoUser: null,
    setTagMangoUser: () => {},
});

export const useAppUser = () => useContext(AppUserContext);

// Convenience hook to get TagMango user data
export const useTagMangoUser = () => {
    const { tagMangoUser } = useContext(AppUserContext);
    return tagMangoUser;
};

// Convenience hook to check if user is authenticated with TagMango
export const useIsTagMangoAuthenticated = () => {
    const { tagMangoUser } = useContext(AppUserContext);
    return tagMangoUser !== null;
};