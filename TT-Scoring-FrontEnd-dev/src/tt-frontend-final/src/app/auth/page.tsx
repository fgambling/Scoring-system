"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Grid, Box, Typography } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { UserRole, useUserContext } from "@/context/UserContext";

// ============================================================================
// STYLES
// ============================================================================

/**
 * Main container style for the authentication page
 * Provides full-screen layout with centered content
 */
const mainContainerStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  width: "100%",
  backgroundColor: "#9C94A5", // Purple background color
};

/**
 * Content box style containing the main interface
 * Provides padding and background for the role selection area
 */
const boxStyle = {
  height: "95%",
  width: "100%",
  backgroundColor: "#FBF3FB", // Light purple background
  display: "flex",
  flexDirection: "column",
  paddingTop: "70px",
  paddingLeft: "70px",
  paddingBottom: "70px",
  paddingRight: "70px",
};

/**
 * Header typography style for the welcome message
 */
const typographyHeaderStyle = {
  fontSize: "1.8rem",
};

/**
 * Exit icon style for the logout button
 * Provides hover effects and proper positioning
 */
const exitIconStyle = {
  fontSize: "4vw",
  color: "#5E486D", // Dark purple color
  paddingLeft: "20px",
  cursor: "pointer",
  ":hover": {
    color: "#9C94A5", // Lighter purple on hover
  },
};

/**
 * Role selection box style
 * Centers content and provides clickable area
 */
const roleBoxStyle = {
  textAlign: "center",
  cursor: "pointer",
};

/**
 * Role icon style for each user role
 * Large icons with hover effects
 */
const roleIconStyle = {
  fontSize: "10vw",
  color: "#5E486D", // Dark purple color
  ":hover": {
    color: "#9C94A5", // Lighter purple on hover
  },
};

/**
 * Role typography style for role labels
 * Bold text with hover effects
 */
const roleTypographyStyle = {
  color: "#5E486D", // Dark purple color
  fontWeight: "bold",
  paddingTop: "40px",
  fontSize: "3vw",
  ":hover": {
    color: "#9C94A5", // Lighter purple on hover
  },
};

/**
 * Authentication page component that displays role selection interface
 * Shows different roles based on user permissions and allows navigation to role-specific dashboards
 */
const ChooseRolePage = () => {
  // ============================================================================
  // HOOKS
  // ============================================================================
  const router = useRouter();
  const { userRoles, userName } = useUserContext();

  /**
   * Handles user logout by removing access token and redirecting to home page
   */
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/");
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <Container component="main" maxWidth={false} sx={mainContainerStyle}>
      <Box sx={boxStyle}>
        {/* Welcome header with user name and logout button */}
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

        {/* Role selection grid */}
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ paddingTop: "150px" }}
        >
          {/* Admin role - only shown if user has admin permissions */}
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
          
          {/* Test Developer role - only shown if user has test developer permissions */}
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
          
          {/* Marker role - only shown if user has marker permissions */}
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
