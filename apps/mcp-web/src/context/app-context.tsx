import { createContext, useState } from "react";

export const AppContext = createContext({
  openConnectModal: false,
  setOpenConnectModal: (openConnectModal: boolean) => {},
});

export const AppContextProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const [openConnectModal, setOpenConnectModal] = useState(false);

  return (
    <AppContext.Provider value={{ openConnectModal, setOpenConnectModal }}>
      {children}
    </AppContext.Provider>
  );
};
