import React from "react";
import QuestionContent from "./TestContent/QuestionContent";
import QuestionList from "./TestContent/QuestionList";
import TestFooter from "./TestContent/TestFooter";

const TestContent = () => {
  // hooks -------------------------------------------------------------------

  // handlers ----------------------------------------------------------------

  // jsx ---------------------------------------------------------------------

  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full">
        <div className="flex flex-row grow">
          <QuestionContent />
          <QuestionList />
        </div>

        <TestFooter />
      </div>
    </div>
  );
};

export default TestContent;
