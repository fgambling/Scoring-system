import React from "react";
import QuestionContent from "./TestContent/QuestionContent";
import QuestionList from "./TestContent/QuestionList";
import TestFooter from "./TestContent/TestFooter";

/**
 * Main test content component that provides the interface for test development
 * This component orchestrates the test creation and editing workflow
 * 
 * Layout Structure:
 * - QuestionContent: Main editing area for question details and answer keys
 * - QuestionList: Sidebar showing all questions in the test
 * - TestFooter: Bottom panel with test management actions
 */
const TestContent = () => {
  // ============================================================================
  // HOOKS
  // ============================================================================

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full">
        {/* Main content area with question editor and question list */}
        <div className="flex flex-row grow">
          {/* Question content area - where users edit question details and answer keys */}
          <QuestionContent />
          
          {/* Question list sidebar - shows all questions in the test */}
          <QuestionList />
        </div>

        {/* Test footer - contains test management actions like save, publish, etc. */}
        <TestFooter />
      </div>
    </div>
  );
};

export default TestContent;
