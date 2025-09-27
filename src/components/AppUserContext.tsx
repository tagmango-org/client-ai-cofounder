import { createContext, useContext } from 'react';

export const AppUserContext = createContext({
    currentAppUser: null,
    setCurrentAppUser: () => {},
    appUserLoading: true,
});

export const useAppUser = () => useContext(AppUserContext);