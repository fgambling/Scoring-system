//external import
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  use,
} from "react";

//internal import
import { saveTestContentRequest } from "@/utils/http";
import { useSnackbar } from "./SnackbarContext";
import { fetchTestContentRequest, fetchTestListRequest } from "@/utils/http";
import {
  SelectedTestContentData,
  TestListItemData,
} from "@/interface/test-developer";

// context and use context hook ------------------------------------------------
interface TestDeveloperContextInterface {
  selectedTestId: string;
  setSelectedTestId: React.Dispatch<React.SetStateAction<string>>;
  selectedQuestionId: string;
  setSelectedQuestionId: React.Dispatch<React.SetStateAction<string>>;
  testList: TestListItemData[];
  setTestList: React.Dispatch<React.SetStateAction<TestListItemData[]>>;
  selectedTestContent: SelectedTestContentData | null;
  setSelectedTestContent: React.Dispatch<
    React.SetStateAction<SelectedTestContentData | null>
  >;
  reFetchTestListFlag: boolean;
  setReFetchTestListFlag: React.Dispatch<React.SetStateAction<boolean>>;
  // reFetchSelectedTestContentFlag: boolean;
  // setReFetchSelectedTestContentFlag: React.Dispatch<
  //   React.SetStateAction<boolean>
  // >;

  handleSavingSelectedTestContent: (
    testContentToBeSaved: SelectedTestContentData
  ) => Promise<void>;
  // selectedQuestionContent: Question | null;
  // setSelectedQuestionContent: React.Dispatch<
  //   React.SetStateAction<Question | null>
  // >;
}
const TestDeveloperContext = createContext<
  TestDeveloperContextInterface | undefined
>(undefined);

export const useTestDeveloperContext = () => {
  const context = useContext(TestDeveloperContext);
  if (context === undefined) {
    throw new Error(
      "TestDeveloperContext must be used within a TestDeveloperContextProvider"
    );
  }
  return context;
};

// context provider ------------------------------------------------------------
export const TestDeveloperContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // hooks -------------------------------------------------------------------
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const [testList, setTestList] = useState<TestListItemData[]>([]);
  const [selectedTestContent, setSelectedTestContent] =
    useState<SelectedTestContentData | null>(null);

  const [reFetchTestListFlag, setReFetchTestListFlag] =
    useState<boolean>(false);
  const [reFetchSelectedTestContentFlag, setReFetchSelectedTestContentFlag] =
    useState<boolean>(false);

  // const [selectedQuestionContent, setSelectedQuestionContent] =
  //   useState<Question | null>(null);

  const { showSnackbar } = useSnackbar();

  // handlers ----------------------------------------------------------------
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Override the default action to trigger the confirmation dialog
      event.preventDefault();
    };

    // Add the event listener for beforeunload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  //initial test list
  useEffect(() => {
    async function getTestList() {
      try {
        const response = await fetchTestListRequest();
        const testListData = response.data.data as TestListItemData[];

        testListData.forEach((test) => {
          test.reactId = test._id!;
        });

        if (testListData.length > 0) {
          setTestList(testListData);
        }
      } catch (error) {
        if (error instanceof Error) {
          showSnackbar(`Fetch test list failed: ${error.message}`, "error");
        }
      }
    }
    getTestList();
  }, [reFetchTestListFlag]);

  // fetch selected test content when selectedTestId changes
  useEffect(() => {
    const updateSelectedTestContent = async () => {
      //check if selectedTestId is from MongoDB or uuid. If is uuid, means no fetch from DB, return.
      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
      if (
        selectedTestId === "" ||
        selectedTestId === null ||
        !mongoIdRegex.test(selectedTestId)
      ) {
        return;
      }

      try {
        const response = await fetchTestContentRequest(selectedTestId);
        const testContentData = response.data.data as SelectedTestContentData;

        // ! need to add reactId (= _id) to each question and test objects
        testContentData.questionIds.forEach((question) => {
          question.reactId = question._id!;
        });

        const prevSelectedQuestionIndex =
          selectedTestContent?.questionIds.findIndex(
            (q) => q.reactId === selectedQuestionId
          );
        // alert(prevSelectedQuestionIndex);

        // ! update selected test content
        setSelectedTestContent(testContentData);
        // ! update selected question id
        if (prevSelectedQuestionIndex === -1) {
          setSelectedQuestionId(testContentData?.questionIds[0]?.reactId || "");
        } else {
          if (prevSelectedQuestionIndex! < testContentData.questionIds.length) {
            setSelectedQuestionId(
              testContentData?.questionIds[prevSelectedQuestionIndex!]
                ?.reactId || ""
            );
          } else {
            setSelectedQuestionId(
              testContentData?.questionIds[0]?.reactId || ""
            );
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          showSnackbar(
            `Failed to fetch selected test content, ${error.message}`,
            "error"
          );
          throw error;
        }
      }
    };

    updateSelectedTestContent();
  }, [selectedTestId, reFetchSelectedTestContentFlag]);

  // ! save test content to db
  const handleSavingSelectedTestContent = async (
    testContentToBeSaved: SelectedTestContentData
  ) => {
    try {
      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
      const isNewTestToBeSaved =
        testContentToBeSaved._id === null ||
        !mongoIdRegex.test(testContentToBeSaved._id);

      // const response = await saveTestContentRequest(selectedTestContent!);
      const response = await saveTestContentRequest(testContentToBeSaved);

      if (response.status === 200) {
        // even response.status === 200, there is a chance for business logic error
        if (response.data.statusCode === -1) {
          throw new Error(response.data.message);
        }

        showSnackbar("Test saved successfully", "success");
        const testContentAfterSaving = response.data.data
          .test as SelectedTestContentData;

        setReFetchTestListFlag((prev) => !prev);

        if (isNewTestToBeSaved) {
          // for new test only
          setSelectedTestId(testContentAfterSaving!._id!); // ! this will trigger the useEffect that fetches selectedTestContent
        } else {
          // for old test
          setReFetchSelectedTestContentFlag((prev) => !prev);
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        showSnackbar(`save test failed: ${err.message}`, "error");
      }
    }
  };

  // jsx ---------------------------------------------------------------------
  return (
    <TestDeveloperContext.Provider
      value={{
        selectedTestId,
        setSelectedTestId,
        selectedQuestionId,
        setSelectedQuestionId,
        testList,
        setTestList,
        selectedTestContent,
        setSelectedTestContent,
        reFetchTestListFlag,
        setReFetchTestListFlag,

        handleSavingSelectedTestContent,
      }}
    >
      {children}
    </TestDeveloperContext.Provider>
  );
};
