import { Button } from "@mui/material";
import React from "react";

import { useTestDeveloperContext } from "@/context/TestDeveloperContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { deleteTestRequest } from "@/utils/http";
import CustomButton from "../TestContent/CustomButton";

type FormInputs = {
  testName: string;
  testFile: FileList;
};

const ConfirmDeleteModal = () => {
  const { showSnackbar } = useSnackbar();
  const {
    selectedTestId,
    testList,
    setTestList,
    setReFetchTestListFlag,
    setSelectedTestId,
    setSelectedTestContent,
  } = useTestDeveloperContext();

  // handlers ----------------------------------------------------------------
  const handleConfirmDelete = async () => {
    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
    if (mongoIdRegex.test(selectedTestId)) {
      try {
        await deleteTestRequest(selectedTestId);
        setReFetchTestListFlag((prev) => !prev);
        setSelectedTestId("");
        setSelectedTestContent(null);
      } catch (error) {
        if (error instanceof Error) {
          showSnackbar(`Deletes test failed: ${error.message}`, "error");
        }
      }
    } else {
      setTestList((prevState) => {
        if (!prevState) return prevState;

        const newTestList = testList.filter(
          (test) => test.reactId !== selectedTestId
        );

        return newTestList;
      });

      setSelectedTestId("");
      setSelectedTestContent(null);
    }
  };

  // jsx ---------------------------------------------------------------------

  return (
    <div className="w-[300px] p-[20px]">
      <div>
        <div className="text-xl">Are you sure?</div>
        <div className="text-lg my-[20px]">This action cannot be undone.</div>
      </div>

      <div className="flex justify-end">
        <CustomButton
          label="Confirm"
          onClick={handleConfirmDelete}
        ></CustomButton>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
