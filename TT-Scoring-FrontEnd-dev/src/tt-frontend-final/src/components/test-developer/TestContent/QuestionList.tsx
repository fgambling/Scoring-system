//external import
import React from "react";
import { Box, Button, Grid, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { v4 as uuidv4 } from "uuid";

//internal import
import { useTestDeveloperContext } from "@/context/TestDeveloperContext";
import ScrollableWrapper from "@/components/wrappers/ScrollableWrapper";
import { Question } from "@/interface/test-developer";
import CustomButton from "./CustomButton";

const QuestionList = () => {
  const {
    selectedTestContent,
    setSelectedTestContent,
    selectedQuestionId,
    setSelectedQuestionId,
    selectedTestId,
  } = useTestDeveloperContext();

  const handleAddNewQuestion = () => {
    // TODO: add HTTP request api to create a new record in database
    const newQuestion: Question = {
      _id: null,
      title: "New",
      keys: [],
      markLevel: 0,
      reactId: uuidv4(),
      testId: selectedTestId,
      ratingScale: {},
    };

    setSelectedTestContent({
      ...selectedTestContent!,
      questionIds: [
        ...selectedTestContent!.questionIds,
        newQuestion as Question,
      ],
    });

    setSelectedQuestionId(newQuestion.reactId);
  };

  const handleDeleteQuestion = (questionReactId: string) => {
    if (!selectedTestContent) return;

    setSelectedTestContent((prevState) => {
      if (!prevState) return prevState;

      const updatedQuestions = selectedTestContent.questionIds.filter(
        (question) => question.reactId !== questionReactId
      );
      return {
        ...prevState,
        questionIds: updatedQuestions,
      };
    });
  };

  // jsx ---------------------------------------------------------------------

  const renderQuestionListItem = (question: Question, index: number) => {
    return (
      <div key={question.reactId} style={{ marginTop: "10px" }}>
        <Grid container direction="row" justifyContent="space-around">
          <Grid item sx={{ width: "60%" }}>
            <Button
              variant="contained"
              onClick={() => {
                setSelectedQuestionId(question.reactId!);
              }}
              sx={{
                color:
                  selectedQuestionId === question.reactId ? "white" : "black",
                boxShadow: "none",
                width: "100%",
                backgroundColor:
                  selectedQuestionId === question.reactId ? "#5E486D" : "white",
              }}
            >
              Q: {question.title}
            </Button>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => {
                handleDeleteQuestion(question.reactId!);
              }}
            >
              <DeleteIcon></DeleteIcon>
            </IconButton>
          </Grid>
        </Grid>
      </div>
    );
  };

  return (
    <div className="bg-[#FBF3FB] ml-[6px] grow">
      {selectedTestContent && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ m: 3 }}>
              Question List
            </Typography>
            {/* <ScrollableWrapper maxHeight={"calc(57vh)"}> */}
            <ScrollableWrapper maxHeight={"50vh"}>
              <Grid
                container
                direction="column"
                rowSpacing={1}
                justifyContent="space-between"
              >
                {selectedTestContent.questionIds.map((question, index) => {
                  return renderQuestionListItem(question, index);
                })}
              </Grid>
            </ScrollableWrapper>
          </Box>

          <div className="w-[80%]">
            <CustomButton
              label="New Question"
              onClick={handleAddNewQuestion}
            ></CustomButton>
          </div>
        </Box>
      )}

      {!selectedTestContent && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p className="text-[20px]">No test selected</p>
        </Box>
      )}
    </div>
  );
};

export default QuestionList;
