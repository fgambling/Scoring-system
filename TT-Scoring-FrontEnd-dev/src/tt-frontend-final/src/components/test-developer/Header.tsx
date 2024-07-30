import React from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import logoU from "../../../public/assets/logo-unimelb.png";
import Image from "next/image";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import BasicModal from "../wrappers/BasicModal";
import UserProfileModal from "./modals/UserProfileModal";
import HelpModal from "./modals/HelpModal";
import { useTestDeveloperContext } from "@/context/TestDeveloperContext";

const Header = () => {
  // hooks -------------------------------------------------------------------
  const router = useRouter();
  const { selectedTestId } = useTestDeveloperContext();

  // handlers ---------------------------------------------------------------
  const handleLogout = () => {
    if (selectedTestId) {
      const userConfirmed = confirm(
        "Changes made in the current test will be lost if you haven't save it, do you want to proceed?"
      );
      if (!userConfirmed) {
        return;
      }
    }

    localStorage.removeItem("accessToken");
    router.push("/");
  };

  const handleChooseRole = () => {
    if (selectedTestId) {
      const userConfirmed = confirm(
        "Changes made in the current test will be lost if you haven't save it, do you want to proceed?"
      );
      if (!userConfirmed) {
        return;
      }
    }

    router.push("/auth");
  };

  const iconButtonData = [
    { icon: HomeOutlinedIcon, onClick: handleChooseRole },
    {
      icon: Person2OutlinedIcon,
      onClick: () => console.log("Profile clicked - change password"),
    },
    {
      icon: HelpOutlineOutlinedIcon,
      onClick: () => console.log("Help clicked - app introduction"),
    },
    { icon: LogoutOutlinedIcon, onClick: handleLogout },
  ];

  // jsx ---------------------------------------------------------------------
  return (
    <AppBar position="static">
      <Toolbar sx={{ bgcolor: "#FBF3FB" }}>
        <Box sx={{ width: 90, height: 90, display: "flex" }}>
          <Image src={logoU} alt="logo" />
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mx: 4,
          }}
        >
          <Typography variant="h4" component="div" sx={{ color: "#5E486D" }}>
            Test Developer
          </Typography>
          <Box className="flex flex-row gap-[10px]">
            {iconButtonData.map((data) => {
              if (data.icon === Person2OutlinedIcon) {
                return (
                  <BasicModal
                    key={uuidv4()}
                    modalContent={<UserProfileModal />}
                  >
                    <IconButton>
                      <data.icon />
                    </IconButton>
                  </BasicModal>
                );
              } else if (data.icon === HelpOutlineOutlinedIcon) {
                return (
                  <BasicModal key={uuidv4()} modalContent={<HelpModal />}>
                    <IconButton>
                      <data.icon />
                    </IconButton>
                  </BasicModal>
                );
              }

              return (
                <IconButton key={uuidv4()} onClick={data.onClick}>
                  <data.icon />
                </IconButton>
              );
            })}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
