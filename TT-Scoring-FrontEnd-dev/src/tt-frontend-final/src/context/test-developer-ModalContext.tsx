import React, {
  createContext,
  useContext,
  ReactNode,
  FunctionComponent,
} from "react";

interface ModalContextType {
  handleModalClose: () => void;
}

const ModalContext = createContext<ModalContextType>({
  handleModalClose: () => {},
});

interface ModalProviderProps {
  children: ReactNode;
  value: ModalContextType;
}

// this context is to support compound component pattern for defining BasicModal
export const ModalProvider: FunctionComponent<ModalProviderProps> = ({
  children,
  value,
}) => {
  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

export const useModalContext = () => useContext(ModalContext);
