"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRole, useUserContext } from "@/context/UserContext";

/**
 * all pages that require authentication should be wrapped in this layout
 * @param children
 */
const AuthLayout = ({ children }: { children: React.ReactElement }) => {
  // hooks -------------------------------------------------------------------
  const router = useRouter();
  const { setUserRoles, setUserId, setUserName } = useUserContext();

  // handlers ----------------------------------------------------------------
  const handleUserAuthenticationCheck = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/");
      return;
    }

    const decodedToken = jwt.decode(accessToken) as JwtPayload;
    const tokenRoles = decodedToken.roles as UserRole[];
    const tokenUserId = decodedToken.sub as string;
    const tokenUsername = decodedToken.username as string;
    setUserRoles(tokenRoles);
    setUserId(tokenUserId);
    setUserName(tokenUsername);
  };

  useEffect(() => {
    handleUserAuthenticationCheck();

    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${localStorage.getItem("accessToken")}`;
  }, []);

  // jsx ---------------------------------------------------------------------
  return <div>{children}</div>;
};

export default AuthLayout;
