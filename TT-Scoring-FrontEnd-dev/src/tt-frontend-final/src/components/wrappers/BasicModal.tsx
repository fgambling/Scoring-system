import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { ModalProvider } from "@/context/test-developer-ModalContext";

const baseStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  //   width: 500,
  transform: "translate(-50%, -50%)",
  bgcolor: "#FBF3FB",
  border: "8px solid #9C94A5",
  boxShadow: 24,
  p: 1,
};

interface BasicModalProps {
  children: React.ReactNode;
  modalContent: React.ReactNode;
  modalWidth?: string;
}

const BasicModal = ({
  children,
  modalContent,
  modalWidth,
}: BasicModalProps) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <div onClick={handleOpen}>{children}</div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...baseStyle }}>
          <Box className="flex flex-row justify-end">
            <button type="button" onClick={() => setOpen(false)}>
              <div className="w-[28px] h-[28px] rounded-full border-[2px] border-[black] ">
                <CloseIcon />
              </div>
            </button>
          </Box>
          <ModalProvider value={{ handleModalClose: handleClose }}>
            {modalContent}
          </ModalProvider>
        </Box>
      </Modal>
    </div>
  );
};

export default BasicModal;
