import { useModalContext } from "@/context/test-developer-ModalContext";
import { Button, TextField } from "@mui/material";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import CustomButton from "../TestContent/CustomButton";
import { uploadNewTestExcelRequest } from "@/utils/http";
import { SelectedTestContentData } from "@/interface/test-developer";
import { useSnackbar } from "@/context/SnackbarContext";
import { useTestDeveloperContext } from "@/context/TestDeveloperContext";
import { useUserContext } from "@/context/UserContext";

type NewTestByUploadExcelFormInputs = {
  testName: string;
  testFile: FileList;
};

const NewTestByUploadModal = () => {
  // hooks -------------------------------------------------------------------
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewTestByUploadExcelFormInputs>();
  const { handleModalClose } = useModalContext();
  const { showSnackbar } = useSnackbar();
  const { handleSavingSelectedTestContent } = useTestDeveloperContext();
  const { userId } = useUserContext();

  // handlers ----------------------------------------------------------------
  const onSubmit: SubmitHandler<NewTestByUploadExcelFormInputs> = async (
    formData
  ) => {
    const testName = formData.testName;
    const testFile = formData.testFile[0];

    try {
      const response = await uploadNewTestExcelRequest(testName, testFile);
      const newTestContent = response.data.data as SelectedTestContentData;
      newTestContent.developerId = userId;
      newTestContent.questionIds.forEach((questionId) => {
        if (!questionId.markLevel) {
          questionId.markLevel = 1; // by default
        }
      });

      if (response.data.statusCode === 200) {
        showSnackbar(
          "Test information parsed from excel successfully",
          "success"
        );
        // - update test list and selected test content
        handleSavingSelectedTestContent(newTestContent);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar(error.message, "error");
      }
    } finally {
      handleModalClose();
    }
  };

  // jsx ---------------------------------------------------------------------
  const newTestNameInput = (
    <TextField
      label="New Test Name"
      variant="outlined"
      size="small"
      {...register("testName", { required: true })}
      error={Boolean(errors.testName)}
      helperText={errors.testName ? "Test name is required" : ""}
    />
  );

  const fileInput = (
    <div className="my-[20px]">
      <input
        type="file"
        accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        {...register("testFile", { required: true })}
      />
      {errors.testFile && <p className="text-red-500">File is required</p>}
    </div>
  );

  return (
    <div className="p-[16px]">
      <form className="w-full">
        <div className="flex flex-col">
          {newTestNameInput}
          {fileInput}
        </div>

        <div className="flex justify-end">
          <CustomButton
            label="upload test"
            onClick={handleSubmit(onSubmit)}
            sx={{ m: 1 }}
          ></CustomButton>
        </div>
      </form>
    </div>
  );
};

export default NewTestByUploadModal;
