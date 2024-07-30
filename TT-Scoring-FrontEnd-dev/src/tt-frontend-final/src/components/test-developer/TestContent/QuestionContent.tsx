import { useTestDeveloperContext } from "@/context/TestDeveloperContext";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import EditableTextField, {
  useHandleUpdateQuestion,
} from "./EditableTextField";
import { Key, Question } from "../../../interface/test-developer";
import ScrollableWrapper from "@/components/wrappers/ScrollableWrapper";
import CustomButton from "./CustomButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import { generateAltKeys } from "@/utils/http";
import { v4 as uuidv4 } from "uuid";
import { useSnackbar } from "@/context/SnackbarContext";
import LoadingButton from "@mui/lab/LoadingButton";
import BasicModal from "@/components/wrappers/BasicModal";
import SetRateScaleModal from "../modals/SetRateScaleModal";

const QuestionContent = () => {
  const {
    selectedTestContent,
    selectedQuestionId,
    setSelectedQuestionId,
    setSelectedTestContent,
  } = useTestDeveloperContext();
  const handleUpdateQuestion = useHandleUpdateQuestion();
  const [gridKey, setGridKey] = useState(uuidv4());
  const { showSnackbar } = useSnackbar();
  const [loadingStatus, setLoadingStatus] = useState(false);

  const selectedQuestion = selectedTestContent?.questionIds.find(
    (question) => question.reactId === selectedQuestionId
  );

  useEffect(() => {
    setGridKey(uuidv4());
  }, [
    selectedQuestionId,
    selectedTestContent,
    setSelectedTestContent,
    selectedQuestion,
  ]);

  const handleGenAltKeys = async (): Promise<void> => {
    setLoadingStatus(true);
    const keyStrings: string[] =
      selectedQuestion?.keys.map((keyItem) => keyItem.key) || [];

    try {
      const response = await generateAltKeys(keyStrings);
      const keys = response.data.data;

      if (keys != "") {
        handleUpdateQuestion("keys", keys);
      }
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar(
          `Generate Alternative Keys Failed: ${error.message}`,
          "error"
        );
      }
    }
    setLoadingStatus(false);
  };

  const handleDeleteKey = (keyIndex: number) => {
    setSelectedTestContent((prev) => {
      if (!prev) return null;
      const questionIndex = prev?.questionIds.findIndex(
        (q) => q.reactId === selectedQuestionId
      );
      if (questionIndex === -1) {
        return prev;
      }
      const updatedQuestions = prev?.questionIds.map((question, index) => {
        if (index === questionIndex) {
          const updatedKeys = question.keys.filter(
            (keyItem, index) => index !== keyIndex
          );
          return { ...question, keys: updatedKeys };
        }
        return question;
      });
      return {
        ...prev,
        questionIds: updatedQuestions,
      };
    });
  };

  const handleAddKey = () => {
    const newKey: Key = {
      key: "",
      alternativeKeys: {},
    };
    setSelectedTestContent((prev) => {
      if (!prev) return null;
      const questionIndex = prev?.questionIds.findIndex(
        (q) => q.reactId === selectedQuestionId
      );
      if (questionIndex === -1) {
        console.error("Question not found");
        return prev;
      }
      const updatedQuestions = prev?.questionIds.map((question, index) => {
        if (index === questionIndex) {
          return { ...question, keys: [...question.keys, newKey] };
        }
        return question;
      });
      return {
        ...prev,
        questionIds: updatedQuestions,
      };
    });
  };

  const handleNavigateQuestion = (
    event: React.ChangeEvent<{}>,
    newValue: number
  ) => {
    const questions = selectedTestContent?.questionIds;
    const selectedQuestionIndex = questions?.findIndex(
      (q) => q.reactId === selectedQuestionId
    );
    if (selectedQuestionIndex === -1) return;

    if (newValue === 0 && selectedQuestionIndex! > 0) {
      setSelectedQuestionId(questions![selectedQuestionIndex! - 1].reactId);
    } else if (
      newValue === 1 &&
      selectedQuestionIndex! < questions!.length - 1
    ) {
      setSelectedQuestionId(questions![selectedQuestionIndex! + 1].reactId);
    }
  };

  const questionInput = (
    <EditableTextField
      label="Question"
      value={selectedQuestion?.title}
      grid={8}
    />
  );

  const keyInput = (
    <>
      {selectedQuestion?.keys.map((keyItem: Key, index) => (
        <Grid
          key={`${gridKey}-${index}`}
          container
          rowSpacing={0.5}
          marginBottom={3.5}
          alignItems="center"
        >
          <EditableTextField
            label="Key"
            value={keyItem.key}
            index={index}
            grid={9}
          />
          <Grid item xs={2}>
            <Button
              size="large"
              endIcon={<DeleteIcon />}
              onClick={() => {
                handleDeleteKey(index);
              }}
            >
              Delete
            </Button>
          </Grid>
          <EditableTextField
            index={index}
            label="Alternative Key"
            value={Object.entries(keyItem.alternativeKeys)
              .map(([altKey, altValues]) => `${altKey}: ${altValues.join(",")}`)
              .join("\n")}
            textFieldProps={{ multiline: true }}
            grid={9}
          />
        </Grid>
      ))}
    </>
  );

  const scoreInput = (
    <EditableTextField
      label="Score"
      value={selectedQuestion?.markLevel}
      grid={2}
      textFieldProps={{
        type: "number",
        inputProps: {
          min: "1",
          step: "1",
        },
      }}
    />
  );

  const generateKeyButton = (
    <Grid item>
      <LoadingButton
        fullWidth
        variant="contained"
        loading={loadingStatus}
        onClick={handleGenAltKeys}
        loadingPosition="end"
        sx={{
          color: "black",
          fontWeight: "bold",
          fontSize: "16px",
          backgroundColor: "#FBF3FB !important",
          height: "50px",
          m: 4,
        }}
      >
        Generate Alternative Keys
      </LoadingButton>
    </Grid>
  );

  const addKeyButton = (
    <Grid item>
      <CustomButton
        label="Add New Key"
        onClick={handleAddKey}
        color={false}
      ></CustomButton>
    </Grid>
  );

  const questionNavigation = (
    <BottomNavigation
      sx={{ bgcolor: "#FBF3FB" }}
      onChange={handleNavigateQuestion}
    >
      <BottomNavigationAction
        icon={<KeyboardArrowLeftIcon sx={{ fontSize: 40 }} />}
      />
      <BottomNavigationAction
        icon={<KeyboardArrowRightIcon sx={{ fontSize: 40 }} />}
      />
    </BottomNavigation>
  );

  return (
    <>
      {selectedTestContent && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            bgcolor: "#FBF3FB",
            width: { md: "60%", lg: "70%" },
            justifyContent: "space-between",
          }}
        >
          {/* <ScrollableWrapper maxHeight="70vh" maxWidth="60vw"> */}
          <ScrollableWrapper maxHeight="65vh" maxWidth="60vw">
            <Paper
              sx={{
                margin: 4,
                p: 3,
                flexGrow: 1,
                minWidth: 1000,
              }}
            >
              {selectedQuestion ? (
                <Grid
                  container
                  columnSpacing={0}
                  alignItems="center"
                  key={selectedQuestionId}
                  marginTop={1}
                >
                  {questionInput}
                  {/* {scoreInput} */}

                  <BasicModal modalContent={<SetRateScaleModal />}>
                    <Button variant="outlined" size="large" className="ml-6">
                      set rate scale
                    </Button>
                  </BasicModal>

                  {generateKeyButton}
                  {keyInput}
                  {addKeyButton}
                </Grid>
              ) : (
                <Typography variant="body1">No question selected!</Typography>
              )}
            </Paper>
          </ScrollableWrapper>
          {questionNavigation}
        </Box>
      )}

      {!selectedTestContent && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#FBF3FB",
            // minWidth: { lg: "60%" },
            width: { md: "60%", lg: "70%" },
          }}
        >
          <p className="text-[20px]">No test selected</p>
        </Box>
      )}
    </>
  );
};

export default QuestionContent;
