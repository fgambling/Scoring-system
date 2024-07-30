import TextField, { TextFieldProps } from "@mui/material/TextField";
import React, { useState } from "react";
import { Grid, Typography } from "@mui/material";
import { useTestDeveloperContext } from "@/context/TestDeveloperContext";
import set from "lodash/set";
import { AlternativeKeys } from "@/interface/test-developer";

interface EditableTextFieldProps {
  label: string;
  value: string | number | undefined;
  textFieldProps?: TextFieldProps;
  index?: number;
  grid: number;
}

/**
 * @param path - A lodash path string used to specify the exact location within the state
 *               where updates should be applied. This path is utilized by lodash's set or
 *               get methods, for example.
 */
export const useHandleUpdateQuestion = () => {
  const { selectedTestContent, setSelectedTestContent, selectedQuestionId } =
    useTestDeveloperContext();

  return (path: string, newContent: string | AlternativeKeys) => {
    const questions = selectedTestContent?.questionIds;
    if (!questions) {
      console.error("No questions available.");
      return -1;
    }
    const currentQuestionIndex = questions.findIndex(
      (q) => q.reactId === selectedQuestionId
    );
    if (currentQuestionIndex === -1) return;

    const updatedQuestions = [...selectedTestContent!.questionIds];

    set(updatedQuestions[currentQuestionIndex], path, newContent);
    setSelectedTestContent((prevState) => {
      if (!prevState) return null;
      return {
        ...prevState,
        questionIds: updatedQuestions,
      };
    });
  };
};

const EditableTextField: React.FC<EditableTextFieldProps> = ({
  label,
  value,
  textFieldProps = {},
  index,
  grid,
}) => {
  const [inputValue, setInputValue] = useState(
    textFieldProps.type === "number" ? Number(value) : value
  );
  const handleUpdateQuestion = useHandleUpdateQuestion();

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue =
      textFieldProps.type === "number"
        ? Number(event.target.value)
        : event.target.value;
    setInputValue(newValue);
  };

  const handleBlurChange = () => {
    if (label === "Question") {
      handleUpdateQuestion("title", inputValue!.toString());
    } else if (label === "Score") {
      handleUpdateQuestion("markLevel", inputValue!.toString());
    } else if (label === "Key") {
      handleUpdateQuestion(`keys[${index}].key`, inputValue!.toString());
    } else if (label === "Alternative Key") {
      const categories = inputValue!.toString().split("\n");
      const altKeys: AlternativeKeys = {};

      categories.forEach((category) => {
        const parts = category.split(":");
        if (parts.length === 2) {
          let key = parts[0].trim();
          let values = parts[1]
            .trim()
            .split(",")
            .map((value) => value.trim());

          altKeys[key] = values;
        }
      });

      handleUpdateQuestion(`keys[${index}].alternativeKeys`, altKeys);
    }
  };
  return (
    <>
      <Grid item xs={1}>
        <Typography>{label}:</Typography>
      </Grid>
      <Grid item xs={grid}>
        <TextField
          label={value ? "" : `Please input ${label} here`}
          variant="outlined"
          fullWidth
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlurChange}
          {...textFieldProps}
        />
      </Grid>
    </>
  );
};

export default EditableTextField;
