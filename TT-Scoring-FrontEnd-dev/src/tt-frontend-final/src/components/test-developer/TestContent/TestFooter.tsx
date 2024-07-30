import { Button } from "@mui/material";
import React from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useUserContext } from "@/context/UserContext";
import BasicModal from "@/components/wrappers/BasicModal";
import TestConfigModal from "../modals/TestConfigModal";
import { useTestDeveloperContext } from "@/context/TestDeveloperContext";
import { formatISODateSimple } from "@/utils/format";
import ConfrimDeleteModal from "../modals/ConfirmDeleteModal";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import { set } from "lodash";

const TestFooter = () => {
  // hooks -------------------------------------------------------------------
  const { userName } = useUserContext();
  const {
    selectedTestContent,
    handleSavingSelectedTestContent,
    setSelectedTestContent,
  } = useTestDeveloperContext();

  // handlers ---------------------------------------------------------------
  const handlePublishSelectedTestContent = (targetPublishStatus: boolean) => {
    const newSelectedTestContent = {
      ...selectedTestContent!,
      isPublished: targetPublishStatus,
    };

    setSelectedTestContent(newSelectedTestContent);
    handleSavingSelectedTestContent(newSelectedTestContent);
  };

  // jsx ---------------------------------------------------------------------
  const testInfo = selectedTestContent && (
    <div>
      <p className="text-[20px] underline">{selectedTestContent?.name}</p>
      <p>Created by: {selectedTestContent.developerId}</p>
      <p>
        Last edited at:{" "}
        {formatISODateSimple(selectedTestContent?.lastStatusChangeTime)}
      </p>
    </div>
  );

  const testToolbar = (
    <div className="flex flex-row gap-[20px] mr-[60px]">
      {!selectedTestContent?.isPublished ? (
        <Button
          variant="outlined"
          size="large"
          onClick={() => {
            handlePublishSelectedTestContent(true);
          }}
          startIcon={<PublishedWithChangesIcon />}
        >
          Publish Test
        </Button>
      ) : (
        <Button
          variant="outlined"
          size="large"
          onClick={() => {
            handlePublishSelectedTestContent(false);
          }}
          startIcon={<UnpublishedIcon />}
        >
          Unpublished Test
        </Button>
      )}

      <Button
        variant="outlined"
        size="large"
        onClick={() => {
          handleSavingSelectedTestContent(selectedTestContent!);
        }}
        startIcon={<CloudUploadIcon />}
      >
        Save Test
      </Button>

      <BasicModal modalContent={<TestConfigModal />}>
        <Button variant="outlined" size="large" startIcon={<SettingsIcon />}>
          Test Option
        </Button>
      </BasicModal>

      <BasicModal modalContent={<ConfrimDeleteModal />}>
        <Button variant="outlined" size="large" startIcon={<DeleteIcon />}>
          Delete Test
        </Button>
      </BasicModal>
    </div>
  );

  return (
    <div className="bg-[#FBF3FB] h-[144px] mt-[6px] p-[20px]">
      {selectedTestContent && (
        <div className="flex flex-row justify-between items-center w-full h-full">
          {testInfo}
          {testToolbar}
        </div>
      )}
      {!selectedTestContent && (
        <div className="flex flex-row justify-center items-center w-full h-full">
          <p className="text-[20px]">No test selected</p>
        </div>
      )}
    </div>
  );
};

export default TestFooter;
