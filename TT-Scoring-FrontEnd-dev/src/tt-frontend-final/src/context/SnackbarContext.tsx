// SnackbarContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";

interface SnackbarContextType {
  showSnackbar: (msg: string, severity?: AlertColor) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");

  const showSnackbar = (msg: string, sev: AlertColor = "success") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
