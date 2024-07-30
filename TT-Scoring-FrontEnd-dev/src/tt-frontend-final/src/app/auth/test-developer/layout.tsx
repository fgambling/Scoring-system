"use client";
import { Container } from "@mui/material";
import { useRouter } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";
import React, { useEffect } from "react";
import { Inter } from "next/font/google";
import { UserRole } from "@/context/UserContext";
import { useSnackbar } from "@/context/SnackbarContext";
import BackgroundWrapper from "@/components/wrappers/BackgroundWrapper";
import Header from "@/components/test-developer/Header";
import { TestDeveloperContextProvider } from "@/context/TestDeveloperContext";

const inter = Inter({ subsets: ["latin"] });

const TestDeveloperLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  // hooks -------------------------------------------------------------------
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  // handlers ----------------------------------------------------------------
  const handleTestDeveloperAuthorizationCheck = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/");
      return;
    }

    const decodedToken = jwt.decode(accessToken) as JwtPayload;
    const tokenRoles = decodedToken.roles;
    if (!tokenRoles.includes(UserRole.TEST_DEVELOPER)) {
      showSnackbar("You are not authorized to access this page", "error");
      router.push("/");
      return;
    }
  };

  useEffect(() => {
    handleTestDeveloperAuthorizationCheck();
  }, []);

  // jsx ---------------------------------------------------------------------
  return (
    <div className={inter.className}>
      <TestDeveloperContextProvider>
        <BackgroundWrapper>
          <div className="flex flex-col h-full">
            <Header />
            {children}
          </div>
        </BackgroundWrapper>
      </TestDeveloperContextProvider>
    </div>
  );
};

export default TestDeveloperLayout;
