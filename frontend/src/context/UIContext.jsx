import React, { createContext, useContext, useState } from 'react';

export const UICtx = createContext({
  authOpen: false,
  setAuthOpen: () => {},
});

export const UIProvider = ({ children }) => {
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <UICtx.Provider value={{ authOpen, setAuthOpen }}>{children}</UICtx.Provider>
  );
};
export const useUI = () => useContext(UICtx);
