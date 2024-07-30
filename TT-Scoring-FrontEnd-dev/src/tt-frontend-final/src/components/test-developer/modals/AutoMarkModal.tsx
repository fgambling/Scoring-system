import React, { useEffect, useState } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Button, Divider, TextField, colors } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CustomButton from "../TestContent/CustomButton";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  assignMarker,
  autoMarkRequest,
  getDownloadResult,
  getMarkedResultRequest,
  fetchMarkers,
} from "@/utils/http";
import { useSnackbar } from "@/context/SnackbarContext";
import { useTestDeveloperContext } from "@/context/TestDeveloperContext";
import { isValidMongoDBId } from "@/utils/format";
import { before, set } from "lodash";
import { TestStatus, markedResult } from "@/interface/test-developer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import DownloadIcon from "@mui/icons-material/Download";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { v4 as uuidv4 } from "uuid";
import { AxiosResponse } from "axios";
import { Height } from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material/Select";

type UploadStudentAnswerFormInput = {
  answerFile: FileList;
};

interface AutoMarkModalProps {
  testId: string;
}

interface Marker {
  username: string;
  _id: string; // Assuming _id is used as a unique identifier
}

const AutoMarkModal = ({ testId }: AutoMarkModalProps) => {
  // hooks -------------------------------------------------------------------

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadStudentAnswerFormInput>();

  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { testList, setTestList, selectedTestId } = useTestDeveloperContext();
  const [result, setResult] = useState<markedResult[]>([]);
  const testStatus = testList.find((test) => test.reactId === testId)?.status; // a derived state
  const [marker, setMarker] = useState("");
  const [names, setNames] = useState<Marker[]>([]);
  const [markerId, setMarkerId] = useState("");

  // handler -----------------------------------------------------------------
  useEffect(() => {
    const loadMarkers = async () => {
      try {
        const response = await fetchMarkers();
        if (response.data.statusCode === 200) {
          setNames(response.data.data);
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        if (error instanceof Error) {
          showSnackbar(`Fetching Markers Failed: ${error.message}`, "error");
        }
      }
    };
    loadMarkers();
  }, []);

  useEffect(() => {
    const selectedtest = testList.find((test) => test._id === selectedTestId);
    if (selectedtest) {
      const assignedName = names.find(
        (name) => name._id === selectedtest.markedBy
      );
      if (assignedName) {
        setMarker(assignedName.username);
        setMarkerId(assignedName._id);
      }
    }
  }, [testList, names, selectedTestId, setTestList]);

  useEffect(() => {
    async function getResult() {
      const response = await getMarkedResultRequest(testId);
      const completedQ = response.data.data.completed;
      const flaggedQ = response.data.data.flagged;

      const updatedResult = [
        {
          type: "Passed",
          percentage: ((completedQ / (completedQ + flaggedQ)) * 100).toFixed(2),
          questionNumber: completedQ,
        },
        {
          type: "Flagged",
          percentage: ((flaggedQ / (completedQ + flaggedQ)) * 100).toFixed(2),
          questionNumber: flaggedQ,
        },
      ];

      setResult(updatedResult);
    }
    if (testStatus !== TestStatus.Unmarked) {
      getResult();
    }
  }, []);

  const onSubmit: SubmitHandler<UploadStudentAnswerFormInput> = async (
    formData
  ) => {
    try {
      if (!testId) {
        throw new Error("Test not selected");
      }

      if (!isValidMongoDBId(testId)) {
        throw new Error("Please save the test before auto marking.");
      }

      setIsLoading(true);

      const response = await autoMarkRequest(testId, formData.answerFile[0]); // this will change test status in database

      if (response.data.statusCode === 200) {
        // update test list
        let status = "";
        let responseToResult: AxiosResponse<any, any>;

        while (
          !(
            status === TestStatus.AutoMarkFlagged ||
            status === TestStatus.MarkCompleted
          )
        ) {
          responseToResult = await getMarkedResultRequest(testId);
          status = responseToResult.data.data.status;
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
        }

        const completedQ = responseToResult!.data.data.completed;
        const flaggedQ = responseToResult!.data.data.flagged;

        const updatedResult = [
          {
            type: "Passed",
            percentage: ((completedQ / (completedQ + flaggedQ)) * 100).toFixed(
              2
            ),
            questionNumber: completedQ,
          },
          {
            type: "Flagged",
            percentage: ((flaggedQ / (completedQ + flaggedQ)) * 100).toFixed(2),
            questionNumber: flaggedQ,
          },
        ];

        setResult(updatedResult);

        const updatedTestList = testList.map((test) => {
          if (test.reactId === testId) {
            return {
              ...test,
              status: responseToResult.data.data.status as TestStatus,
            };
          }
          return test;
        });
        setTestList(updatedTestList);

        showSnackbar("Auto Marking Completed", "success");
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar(error.message, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getDownloadFile = async () => {
    try {
      const result = await getDownloadResult(testId, {
        responseType: "blob",
      });
      if (result.data instanceof Blob) {
        const url = window.URL.createObjectURL(result.data);

        const link = document.createElement("a");
        link.href = url;
        const contentDisposition = result.headers["content-disposition"];
        let filename = "download.xlsx";

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename\*?=([^;]+)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = decodeURIComponent(filenameMatch[1].replace(/\"/g, ""));
          }
        }

        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error("The response is not a blob:", result.data);
        showSnackbar(
          "Failed to download file: The server did not return a Blob.",
          "error"
        );
      }
    } catch (error) {
      showSnackbar("Failed to download file", "error");
    }
  };

  const handleAssignMarker = async (): Promise<void> => {
    try {
      const response = await assignMarker(markerId, selectedTestId);
      if (response.data.statusCode === 200) {
        showSnackbar("Assign marker successfully", "success");
        const updatedTestList = testList.map((test) => {
          if (test._id === selectedTestId) {
            return { ...test, markedBy: markerId };
          }
          return test;
        });

        setTestList(updatedTestList);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar(`Assign Marker Failed: ${error.message}`, "error");
      }
    }
  };

  const handleMarkerChange = (event: SelectChangeEvent) => {
    setMarker(event.target.value);
    const selectedMarker = names.find(
      (marker) => marker.username === event.target.value
    );
    if (selectedMarker) {
      setMarkerId(selectedMarker._id);
    }
  };

  const markerUI = (
    <FormControl fullWidth style={{ marginTop: "28px" }}>
      <InputLabel id="marker-label">Marker</InputLabel>
      <Select
        labelId="marker-label"
        value={marker}
        onChange={handleMarkerChange}
        label="Marker"
        MenuProps={{
          PaperProps: {
            style: {
              width: 230,
              maxHeight: 260,
              overflow: "auto",
            },
          },
        }}
      >
        {names.map((marker) => (
          <MenuItem key={marker._id} value={marker.username}>
            {marker.username}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const downloadButton = {
    fontSize: "30px",
    color: "#9c94a5",
    margin: "7px",
    ":hover": {
      color: "#5E486D",
    },
  };

  // jsx ---------------------------------------------------------------------
  const beforeAutoMarkingUI = testStatus === TestStatus.Unmarked && (
    <form className="w-full">
      <div className="flex flex-col">
        <div className="mb-[20px] flex flex-col">
          <label htmlFor="studentAnswerFile" className="text-[24px] mb-2">
            Upload Student Answer Spreadsheet
          </label>
          <input
            type="file"
            id="studentAnswerFile"
            {...register("answerFile", { required: true })}
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
          {errors.answerFile && (
            <p className="text-red-500">Answer File is required</p>
          )}
          {isLoading && <p className="text-slate-500">Auto Marking...</p>}
        </div>

        <CustomButton
          label="Start Auto Mark"
          onClick={handleSubmit(onSubmit)}
          sx={{ width: "300px", margin: "4px 4px 16px 4px" }}
        />
      </div>
    </form>
  );

  const afterAutoMarkingUI = testStatus !== TestStatus.Unmarked && (
    <div>
      <div className="my-3">
        <label className="text-[17px] font-bold">
          Result from last auto mark
        </label>
        <IconButton onClick={() => getDownloadFile()} sx={downloadButton}>
          <DownloadIcon />
        </IconButton>
      </div>

      <div className="my-3">
        <TableContainer component={Paper} className="w-full">
          <Table size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell className="font-bold text-center">Type</TableCell>
                <TableCell className="font-bold text-center">
                  Percentage
                </TableCell>
                <TableCell className="font-bold text-center">
                  Question Number
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.map((row) => (
                <TableRow key={uuidv4()}>
                  <TableCell className="text-center">{row.type}</TableCell>
                  <TableCell className="text-center">
                    {row.percentage}%
                  </TableCell>
                  <TableCell className="text-center">
                    {row.questionNumber}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <Divider className="w-full" />

      <div className="flex items-center my-5">
        <div className="flex-1 mr-4">{markerUI}</div>
        <div className="mt-10 mb-5">
          <CustomButton
            label="Assign Marker"
            onClick={handleAssignMarker}
            margin={false}
          ></CustomButton>
        </div>
      </div>
    </div>
  );
  return (
    <div className="p-4 w-[600px]">
      {beforeAutoMarkingUI}
      {afterAutoMarkingUI}
    </div>
  );
};
export default AutoMarkModal;
