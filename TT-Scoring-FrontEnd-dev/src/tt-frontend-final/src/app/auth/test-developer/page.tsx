"use client";
import TestContent from "@/components/test-developer/TestContent";
import TestList from "@/components/test-developer/TestList";
import { useUserContext } from "@/context/UserContext";
import { Button, Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

const TestDeveloperPage = () => {
  // hooks -------------------------------------------------------------------
  const router = useRouter();
  const { userName, userId } = useUserContext();

  // handlers ----------------------------------------------------------------

  // jsx ---------------------------------------------------------------------
  return (
    <div className="w-full mt-[12px] grow">
      <div className="flex flex-row h-full">
        <TestList />
        <TestContent />
      </div>
    </div>
  );
};

export default TestDeveloperPage;
