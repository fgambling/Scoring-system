import { useTestDeveloperContext } from "@/context/TestDeveloperContext";
import { Divider, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import CustomButton from "../TestContent/CustomButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { useSnackbar } from "@/context/SnackbarContext";
import { set } from "lodash";
import { useModalContext } from "@/context/test-developer-ModalContext";

interface RatingScaleItem {
  mark: string;
  description: string;
  id: string;
}

const SetRateScaleModal = () => {
  // hooks ---------------------------------------------------------------------
  const {
    selectedTestContent,
    setSelectedTestContent,
    selectedQuestionId,
    handleSavingSelectedTestContent,
  } = useTestDeveloperContext();
  const ratingScaleMap = selectedTestContent?.questionIds.find(
    (question) => question.reactId === selectedQuestionId
  )?.ratingScale; // a derived state
  const { showSnackbar } = useSnackbar();

  const { handleModalClose } = useModalContext();

  //   const ratingScaleArray = Array.from(Object.entries(ratingScaleMap || {}));
  const [ratingScaleArray, setRatingScaleArray] = useState(
    Object.entries(ratingScaleMap || {}).map(([key, value]) => {
      return { mark: key, description: value, id: uuidv4() };
    })
  );

  // handlers -----------------------------------------------------------------
  const handleUpdateMark = (mark: string, id: string) => {
    const newRatingScaleArray = [...ratingScaleArray];
    // newRatingScaleArray[index].mark = mark;
    newRatingScaleArray.forEach((item) => {
      if (item.id === id) {
        item.mark = mark;
      }
    });
    setRatingScaleArray(newRatingScaleArray);
  };

  const handleUpdateDescription = (description: string, id: string) => {
    const newRatingScaleArray = [...ratingScaleArray];
    // newRatingScaleArray[index].description = description;
    newRatingScaleArray.forEach((item) => {
      if (item.id === id) {
        item.description = description;
      }
    });

    setRatingScaleArray(newRatingScaleArray);
  };

  const handleAddRatingScaleItem = () => {
    const newRatingScaleArray = [...ratingScaleArray];
    newRatingScaleArray.push({
      mark: "0",
      description: "",
      id: uuidv4(),
    });
    setRatingScaleArray(newRatingScaleArray);
  };

  const handleRemoveRatingScaleItem = (id: string) => {
    const newRatingScaleArray = ratingScaleArray.filter(
      (item) => item.id !== id
    );
    setRatingScaleArray(newRatingScaleArray);
  };

  const handleConfirm = () => {
    const newRatingScaleMap = new Map<string, string>();
    const seenMarks = new Set<string>();
    try {
      // check for duplicate marks and convert array to map for update selectedTestContent
      for (const item of ratingScaleArray) {
        if (seenMarks.has(item.mark)) {
          throw Error(
            `Duplicate mark found for mark ${item.mark}. Please remove duplicates.`
          );
        }

        if (!item.description) {
          throw Error(
            `Description is empty for mark ${item.mark}. Please add a description for it.`
          );
        }

        seenMarks.add(item.mark);
        newRatingScaleMap.set(item.mark, item.description);
      }

      // update selectedTestContent
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
            return {
              ...question,
              ratingScale: Object.fromEntries(newRatingScaleMap),
            };
          }
          return question;
        });
        return {
          ...prev,
          questionIds: updatedQuestions,
        };
      });

      handleModalClose();
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar(error.message, "error");
      }
    }
  };

  // jsx -----------------------------------------------------------------------
  return (
    <div className="w-[600px] p-4">
      <h2 className="font-bold">Please set rating scale for this question</h2>

      <Divider className="mb-4" />

      <div className="mb-2">
        <span className="font-bold">Mark</span>:{" "}
        <span className="font-bold">Description</span>
      </div>

      <ul>
        {ratingScaleArray.map(({ mark, description, id }) => (
          <li key={id} className="mb-4">
            <input
              className="w-10 text-center border border-slate-500"
              type="number"
              min="0"
              placeholder="0"
              value={Number(mark)}
              onChange={(e) => {
                const mark = e.target.value;
                handleUpdateMark(mark, id);
              }}
            />
            :{" "}
            <input
              type="text"
              value={description}
              placeholder="add your description here"
              className="w-3/4 border border-slate-500 pl-2"
              onChange={(e) => {
                const description = e.target.value;
                handleUpdateDescription(description, id);
              }}
            ></input>
            <IconButton
              onClick={() => {
                handleRemoveRatingScaleItem(id);
              }}
            >
              <RemoveCircleIcon sx={{ color: "black" }} />
            </IconButton>
          </li>
        ))}
      </ul>

      <IconButton onClick={handleAddRatingScaleItem}>
        <AddCircleIcon sx={{ color: "black" }} />
      </IconButton>

      <Divider />

      <div className="flex flex-row justify-end">
        <CustomButton
          label="Confirm"
          onClick={handleConfirm}
          sx={{ width: "100px", margin: "10px 10px 2px 10px" }}
        />
      </div>
    </div>
  );
};

export default SetRateScaleModal;
