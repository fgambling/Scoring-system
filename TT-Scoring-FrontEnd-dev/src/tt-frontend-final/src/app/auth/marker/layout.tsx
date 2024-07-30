"use client";
import { Container } from "@mui/material";
import { useRouter } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";
import React, { useEffect } from "react";
import { Inter } from "next/font/google";
import { UserRole } from "@/context/UserContext";
import { useSnackbar } from "@/context/SnackbarContext";

const inter = Inter({ subsets: ["latin"] });

const MarkerLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  // hooks -------------------------------------------------------------------
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  // handlers ----------------------------------------------------------------
  const handleMarkerAuthorizationCheck = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/");
      return;
    }

    const decodedToken = jwt.decode(accessToken) as JwtPayload;
    const tokenRoles = decodedToken.roles;
    if (!tokenRoles.includes(UserRole.MARKER)) {
      showSnackbar("You are not authorized to access this page", "error");
      router.push("/");
      return;
    }
  };

  useEffect(() => {
    handleMarkerAuthorizationCheck();
  }, []);

  // jsx ---------------------------------------------------------------------
  return (
    <div className={inter.className}>
      <Container
        component="main"
        maxWidth="md"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        {children}
      </Container>
    </div>
  );
};

export default MarkerLayout;
