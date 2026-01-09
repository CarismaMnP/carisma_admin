import { createContext, useContext } from 'react';

export const AuthActionsContext = createContext<any>(null);
export const useAuthActionsContext = () => useContext(AuthActionsContext);
