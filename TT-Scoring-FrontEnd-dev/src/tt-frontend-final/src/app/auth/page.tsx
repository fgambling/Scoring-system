"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Grid, Box, Typography } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { UserRole, useUserContext } from "@/context/UserContext";

// styles -------------------------------------------------------------------
const mainContainerStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  width: "100%",
  backgroundColor: "#9C94A5",
};

const boxStyle = {
  height: "95%",
  width: "100%",
  backgroundColor: "#FBF3FB",
  display: "flex",
  flexDirection: "column",
  paddingTop: "70px",
  paddingLeft: "70px",
  paddingBottom: "70px",
  paddingRight: "70px",
};

const typographyHeaderStyle = {
  fontSize: "1.8rem",
};

const exitIconStyle = {
  fontSize: "4vw",
  color: "#5E486D",
  paddingLeft: "20px",
  cursor: "pointer",
  ":hover": {
    color: "#9C94A5",
  },
};

const roleBoxStyle = {
  textAlign: "center",
  cursor: "pointer",
};

const roleIconStyle = {
  fontSize: "10vw",
  color: "#5E486D",
  ":hover": {
    color: "#9C94A5",
  },
};

const roleTypographyStyle = {
  color: "#5E486D",
  fontWeight: "bold",
  paddingTop: "40px",
  fontSize: "3vw",
  ":hover": {
    color: "#9C94A5",
  },
};

const ChooseRolePage = () => {
  // hooks -------------------------------------------------------------------
  const router = useRouter();
  const { userRoles, userName } = useUserContext();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/");
  };

  // handlers ----------------------------------------------------------------

  // jsx ---------------------------------------------------------------------
  return (
    <Container component="main" maxWidth={false} sx={mainContainerStyle}>
      <Box sx={boxStyle}>
        <Typography
          component="h1"
          variant="h2"
          mb={8}
          sx={typographyHeaderStyle}
        >
          <span style={{ color: "#5E486D" }}>Welcome back </span>
          <span style={{ fontWeight: "bold", color: "#5E486D" }}>
            {userName}
          </span>
          <ExitToAppIcon sx={exitIconStyle} onClick={handleLogout} />
        </Typography>

        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ paddingTop: "150px" }}
        >
          {userRoles.includes(UserRole.ADMIN) && (
            <Grid item xs={4}>
              <Box sx={roleBoxStyle} onClick={() => router.push("/auth/pages/dashboard/admin")}>
                <ManageAccountsIcon sx={roleIconStyle} />
                <Typography variant="body1" sx={roleTypographyStyle}>
                  ADMIN
                </Typography>
              </Box>
            </Grid>
          )}
          {userRoles.includes(UserRole.TEST_DEVELOPER) && (
            <Grid item xs={4}>
              <Box
                sx={roleBoxStyle}
                onClick={() => router.push("/auth/test-developer")}
              >
                <AssignmentIndIcon sx={roleIconStyle} />
                <Typography variant="body1" sx={roleTypographyStyle}>
                  TEST DEVELOPER
                </Typography>
              </Box>
            </Grid>
          )}
          {userRoles.includes(UserRole.MARKER) && (
            <Grid item xs={4}>
              <Box
                sx={roleBoxStyle}
                onClick={() => router.push("/auth/pages/dashboard/marker")}
              >
                <PeopleAltIcon sx={roleIconStyle} />
                <Typography variant="body1" sx={roleTypographyStyle}>
                  MARKER
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default ChooseRolePage;
