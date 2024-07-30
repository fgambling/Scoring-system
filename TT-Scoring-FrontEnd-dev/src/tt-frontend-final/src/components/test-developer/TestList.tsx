//external import
import React, { useEffect } from "react";
import { Button, Grid, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import UploadIcon from "@mui/icons-material/Upload";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from "@mui/icons-material/Add";
import { v4 as uuidv4 } from "uuid";

//internal import
import { useTestDeveloperContext } from "@/context/TestDeveloperContext";
import Spacer from "../Utilities";
import ScrollableWrapper from "@/components/wrappers/ScrollableWrapper";
import BasicModal from "../wrappers/BasicModal";
import NewTestByUploadModal from "./modals/NewTestByUploadModal";
import AutoMarkModal from "./modals/AutoMarkModal";
import { useSnackbar } from "@/context/SnackbarContext";
import {
  SelectedTestContentData,
  MarkConfig,
  MistakeOptions,
  TestStatus,
  Question,
  TestListItemData,
} from "@/interface/test-developer";
import { duplicateTestRequest, setDefaultHeader } from "@/utils/http";
import { useUserContext } from "@/context/UserContext";

const TestList = () => {
  // hooks -------------------------------------------------------------------
  const {
    selectedTestId,
    setSelectedTestId,
    testList,
    setTestList,
    selectedTestContent,
    setSelectedTestContent,
    setSelectedQuestionId,
    reFetchTestListFlag,
    setReFetchTestListFlag,
  } = useTestDeveloperContext();
  const { userId } = useUserContext();

  const { showSnackbar } = useSnackbar();

  // handlers ----------------------------------------------------------------
  useEffect(() => {
    setDefaultHeader(localStorage.getItem("accessToken") as string);
  }, []);

  const handleAddTest = () => {
    const markConfig: MarkConfig = {
      caseMistakesOption: MistakeOptions.Incorrect,
      contractionMistakesOption: MistakeOptions.Incorrect,
      punctuationMistakesOption: MistakeOptions.Incorrect,
      spellingMistakesOption: MistakeOptions.Incorrect,
      grammaticalErrorsOption: MistakeOptions.Incorrect,
    };

    const newTestItem: TestListItemData = {
      _id: null,
      name: "New Test",
      markConfig: markConfig,
      reactId: uuidv4(),
      questionIds: [],
      lastStatusChangeTime: "",
      status: TestStatus.Unmarked,
      developerId: "",
      isPublished: false,
      __v: 0,
      markedBy: "",
    };

    const newQuestion: Question = {
      _id: null,
      title: "New Question",
      keys: [
        {
          key: "This is a sample key",
          alternativeKeys: {
            key: ["keys"],
          },
        },
      ],
      markLevel: 0,
      reactId: uuidv4(),
      ratingScale: {},
      testId: selectedTestId,
    };

    const newTest: SelectedTestContentData = {
      _id: null,
      name: "New Test",
      markConfig: markConfig,
      reactId: newTestItem.reactId,
      questionIds: [newQuestion],
      lastStatusChangeTime: "", // TODO: need to get lastStatusChangeTime from server
      status: TestStatus.Unmarked,
      developerId: userId,
      isPublished: false,
    };

    setSelectedTestId(newTestItem.reactId); // ! this will trigger useEffect that fetched selectedTestContent, but we should not fetch data
    setSelectedQuestionId(newQuestion.reactId);

    setTestList((prevTestList) => [...prevTestList, newTestItem]);
    setSelectedTestContent(newTest);
  };

  const handleDuplicateTest = async (testId: string | null) => {
    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

    if (testId === null || !mongoIdRegex.test(testId)) {
      showSnackbar("Please save test first before duplicating.", "warning");
      return;
    }

    try {
      await duplicateTestRequest(testId);
      setReFetchTestListFlag((prev) => !prev);
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar(`Duplicated test failed: ${error.message}`, "error");
      }
    }
  };

  // jsx ---------------------------------------------------------------------
  const renderTestList = () => {
    return testList.map((test) => {
      return (
        <div key={test.reactId}>
          <Grid
            container
            spacing={2}
            className="justify-center items-center mb-2"
          >
            <Grid item>
              <Button
                variant="contained"
                size="small"
                className={`h-[50px] w-[150px] text-center text-base font-bold cursor-pointer normal-case block whitespace-nowrap overflow-hidden text-ellipsis ${
                  selectedTestId === test.reactId
                    ? "bg-[#5E486D] text-white"
                    : "bg-[#FBF3FB] text-black !important"
                }`}
                onClick={() => {
                  if (selectedTestId && selectedTestId !== test.reactId) {
                    // if user want to switch to another test, but the current test is never saved to db, force user to save it
                    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
                    if (!mongoIdRegex.test(selectedTestId)) {
                      showSnackbar(
                        "Please save the current test first before switching to another test.",
                        "warning"
                      );
                      return;
                    }

                    // user's currently selected test not firstly time save to db
                    const userConfirmed = confirm(
                      "Changes made in the current test will be lost if you haven't save it, do you want to proceed?"
                    );
                    if (!userConfirmed) {
                      return;
                    }
                  }
                  setSelectedTestId(test.reactId);
                }}
              >
                {test.name}
              </Button>
            </Grid>
            <Grid item className={`flex gap-x-[1px] flex-row items-center`}>
              <div className="group relative">
                <div>
                  <InfoIcon
                    sx={{ color: test.isPublished ? "black" : "grey" }}
                  />
                </div>
                <div className="absolute left-[-20px] top-8 bg-white w-20 h-10 hidden group-hover:block border shadow-lg z-[1000] text-center">
                  {test.isPublished ? "Published" : "Drafting"}
                </div>
              </div>

              <IconButton
                onClick={() => {
                  handleDuplicateTest(test._id);
                }}
              >
                <ContentCopyIcon />
              </IconButton>
              <BasicModal
                modalContent={<AutoMarkModal testId={test.reactId} />}
              >
                <IconButton
                  aria-label="auto-mark-test"
                  onClick={() => {
                    if (test._id) {
                      setSelectedTestId(test._id);
                    }
                  }}
                >
                  <DriveFileRenameOutlineIcon />
                </IconButton>
              </BasicModal>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
            className="justify-center items-center mb-2"
          >
            <Grid
              item
              className={`border-dashed border-b-4 border-black w-8/12`}
            ></Grid>
            <Grid item>
              <AddIcon></AddIcon>
            </Grid>
          </Grid>
        </div>
      );
    });
  };

  const renderFooter = () => {
    return (
      <Grid
        className={`inset-x-0 absolute bottom-4 items-center justify-center inline-flex`}
      >
        <Button
          variant="contained"
          className={`h-[50px] w-[150px] text-center text-bas bg-[#FBF3FB] text-black font-bold mr-[10px]`}
          onClick={handleAddTest}
        >
          New Test
        </Button>

        <BasicModal modalContent={<NewTestByUploadModal />}>
          <IconButton aria-label="upload-test" size="large">
            <UploadIcon />
          </IconButton>
        </BasicModal>
      </Grid>
    );
  };

  return (
    <div className="w-[362px] min-w-[150px] h-full bg-[#FBF3FB] mr-[12px] relative ">
      {Spacer(1)}
      <ScrollableWrapper maxHeight={"calc(100vh - 250px)"}>
        {renderTestList()}
      </ScrollableWrapper>
      {renderFooter()}
    </div>
  );
};

export default TestList;
