// ModalContext.tsx
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  ReactElement,
} from "react";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import { submitRequest } from "@/utils/http";
import { useSnackbar } from "@/context/SnackbarContext";
import { TransitionProps } from "@mui/material/transitions";
import '../../public/assets/css/modal.css';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type ModalContextType = {
  isOpen: boolean;
  toggle: (componentElement?: ReactElement, callback?: Function) => void;
  ModalComponent?: ReactElement;
  callback?: Function;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { showSnackbar } = useSnackbar();
  const [isOpen, setIsOpen] = useState(false);
  const [ModalComponent, setModalComponent] = useState<
    ReactElement | undefined
  >();
  const [callback, setCallback] = useState<Function | undefined>();

  const toggle = (componentElement?: ReactElement, callback?: Function) => {
    setIsOpen((prev) => !prev);
    setModalComponent(componentElement);
    setCallback(() => callback);
  };

  return (
    <ModalContext.Provider value={{ isOpen, toggle }}>
      {children}
      {isOpen && ModalComponent && (
        <Dialog
          open={isOpen}
          TransitionComponent={Transition}
          onClose={() => toggle()}
          PaperProps={{
            component: "form",
            onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries((formData as any).entries());
              try {
                // Password reset validation
                if (
                  formJson.type === "Reset" &&
                  formJson.password !== formJson.re_password
                )
                  return showSnackbar(
                    "Password is not match each other",
                    "error"
                  );

                const response = await submitRequest(formJson);

                if (
                  response &&
                  response.role === "admin" &&
                  [200, 201].includes(response.status)
                ) {
                  showSnackbar("Changes Applied!", "success");
                } else if (
                  response &&
                  response.role === "marker" &&
                  [200, 201].includes(response.status)
                ) {
                  showSnackbar("Marked Successfully!", "success");
                }

                callback && callback();

                toggle();
              } catch (error) {
                if (error instanceof Error) {
                  showSnackbar(`Submit form failed: ${error.message}`, "error");
                }
              }
            },
          }}
          className="modal-form"
          aria-labelledby="form-dialog-title"
        >
          {ModalComponent}
          <div className="flex modal-actions p-4">
            <button type="submit" className="uppercase modal-action rounded-lg">
              Save
            </button>
            <button
              className="uppercase modal-action rounded-lg"
              onClick={() => toggle()}
            >
              Discard
            </button>
          </div>
        </Dialog>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
