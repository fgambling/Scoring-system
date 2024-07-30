import React, { createContext, useContext, useState } from "react";

export enum UserRole {
  MARKER = "marker",
  TEST_DEVELOPER = "test developer",
  ADMIN = "admin",
}

interface UserContextInterface {
  userRoles: UserRole[];
  setUserRoles: (roles: UserRole[]) => void;
  userId: string;
  setUserId: (id: string) => void;
  userName: string;
  setUserName: (name: string) => void;
}

const UserContext = createContext<UserContextInterface | undefined>(undefined);

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  return (
    <UserContext.Provider
      value={{
        userRoles,
        setUserRoles,
        userId,
        setUserId,
        userName,
        setUserName,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};
