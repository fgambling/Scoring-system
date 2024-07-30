import { Button, Divider, TextField } from "@mui/material";
import React, { useState } from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { useTestDeveloperContext } from "@/context/TestDeveloperContext";
import {
  MarkConfig,
  MistakeOptions,
  SelectedTestContentData,
} from "@/interface/test-developer";
import { useModalContext } from "@/context/test-developer-ModalContext";

interface TestConfigSelection {
  label: string;
  labelType: keyof MarkConfig;
  value: MistakeOptions;
  setSelectedTestMarkConfig: React.Dispatch<React.SetStateAction<MarkConfig>>;
}

const TestConfigSelection = ({
  label,
  labelType,
  value,
  setSelectedTestMarkConfig,
}: TestConfigSelection) => {
  // hooks --------------------------------------------------------------

  // handlers -----------------------------------------------------------
  const handleSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTestMarkConfig((prevState) => {
      if (!prevState) return prevState;

      return {
        ...prevState,
        [labelType]: e.target.value as MistakeOptions,
      };
    });
  };

  // jsx -----------------------------------------------------------------
  return (
    <FormControl className="flex flex-row items-center justify-between">
      <FormLabel id="demo-row-radio-buttons-group-label" className="mr-[20px]">
        {label}
      </FormLabel>

      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        value={value}
        onChange={handleSelectionChange}
      >
        <FormControlLabel
          value="incorrect"
          control={<Radio />}
          label="Incorrect"
        />
        <FormControlLabel value="flag" control={<Radio />} label="Flag" />
      </RadioGroup>
    </FormControl>
  );
};

const configOptions = [
  { label: "Case Mistakes Option", labelType: "caseMistakesOption" },
  {
    label: "Contraction Mistakes Option",
    labelType: "contractionMistakesOption",
  },
  {
    label: "Punctuation Mistakes Option",
    labelType: "punctuationMistakesOption",
  },
  { label: "Spelling Mistakes Option", labelType: "spellingMistakesOption" },
  { label: "Grammatical Errors Option", labelType: "grammaticalErrorsOption" },
];

const TestConfigModal = () => {
  // hooks --------------------------------------------------------------
  // global states
  const {
    selectedTestContent,
    setSelectedTestContent,
    setTestList,
    selectedTestId,
    handleSavingSelectedTestContent,
  } = useTestDeveloperContext();
  const { handleModalClose } = useModalContext();
  // local states
  const [testNameText, setTextNameText] = useState<string>(
    selectedTestContent?.name || ""
  );
  const [testNameTextError, setTestNameTextError] = useState<string>("");
  const [selectedTestMarkConfig, setSelectedTestMarkConfig] =
    useState<MarkConfig>(selectedTestContent!.markConfig); // just a local state

  // handlers -----------------------------------------------------------
  const handleConfirmTestConfigUpdate = () => {
    if (!testNameText) {
      setTestNameTextError("Test name cannot be empty");
      return;
    } else {
      setTestNameTextError("");
    }

    const newSelectedTestContent: SelectedTestContentData = {
      ...selectedTestContent!,
      name: testNameText,
      markConfig: selectedTestMarkConfig,
    };

    handleSavingSelectedTestContent(newSelectedTestContent);
    handleModalClose();
  };

  // jsx -----------------------------------------------------------------

  const newTestNameInput = (
    <TextField
      label="New Test Name"
      variant="outlined"
      value={testNameText}
      onChange={(e) => setTextNameText(e.target.value)}
      size="small"
      error={!!testNameTextError}
      helperText={testNameTextError}
      placeholder={selectedTestContent?.name}
    />
  );

  const testConfigSelectionList = (
    <ul>
      {configOptions.map((option) => (
        <li key={option.labelType}>
          <TestConfigSelection
            label={option.label}
            labelType={option.labelType as keyof MarkConfig}
            value={selectedTestMarkConfig[option.labelType as keyof MarkConfig]}
            setSelectedTestMarkConfig={setSelectedTestMarkConfig}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="w-[600px] p-[20px]">
      {newTestNameInput}
      <Divider className="my-[20px]" />
      {testConfigSelectionList}
      <Divider className="my-[20px]" />
      <div className="flex flex-row-reverse">
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={handleConfirmTestConfigUpdate}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default TestConfigModal;
