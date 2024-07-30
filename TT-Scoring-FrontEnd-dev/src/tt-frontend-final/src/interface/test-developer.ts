// types related to the test developer interface

export enum MistakeOptions {
  Incorrect = "incorrect",
  Correct = "correct",
  Flag = "flag",
}
export interface MarkConfig {
  caseMistakesOption: MistakeOptions;
  contractionMistakesOption: MistakeOptions;
  punctuationMistakesOption: MistakeOptions;
  spellingMistakesOption: MistakeOptions;
  grammaticalErrorsOption: MistakeOptions;
}

export enum TestStatus {
  Unmarked = "unmarked",
  AutoMarking = "auto marking",
  AutoMarkFlagged = "auto mark flagged",
  MarkInProgress = "marking in progress",
  MarkCompleted = "marking completed",

  // Unmarked = "unmarked",
  // AutoMarkFlagged = "auto marked",
  // MarkInProgress = "marking in progress", // by marker
  // MarkCompleted = "marking completed",
  // AutoMarkFlagged = "auto-mark-flagged",
  // MarkInProgress = "mark-in-progress", // by marker
  // MarkCompleted = "mark-completed",
}

export interface TestListItemData {
  markedBy: string;
  markConfig: MarkConfig;
  _id: string | null; // ! mongoDB unique id, if _id = null, it means this is a new question just created on front-end side, should not use _id as key property
  reactId: string; // ! react unique id that is assign to key property if using map() method. for existing question from database, _id = reactId; for newly created question in front-end, reactId is generated but _id is empty
  name: string;
  questionIds: string[]; // mongoDB unique id
  lastStatusChangeTime: string;
  status: TestStatus;
  developerId: string;
  isPublished: boolean;
  __v: number; //version
}

export interface AlternativeKeys {
  [key: string]: string[];
}
export interface Key {
  key: string;
  alternativeKeys: AlternativeKeys;
}

export interface Question {
  _id: string | null; // ! mongoDB unique id, if _id = null, it means this is a new question just created on front-end side, should not use _id as key property
  reactId: string; // ! react unique id that is assign to key property if using map() method. for existing question from database, _id = reactId; for newly created question in front-end, reactId is generated but _id is empty
  title: string;
  keys: Key[];
  markLevel: number;
  ratingScale: { [key: string]: string };
  testId: string; // mongoDB unique id
  // status: QuestionStatus;        // TODO: to be added
}

export interface SelectedTestContentData {
  markConfig: MarkConfig;
  _id: string | null; // ! mongoDB unique id, if _id = null, it means this is a new question just created on front-end side, should not use _id as key property
  reactId: string; // ! react unique id that is assign to key property if using map() method. for existing question from database, _id = reactId; for newly created question in front-end, reactId is generated but _id is empty
  name: string;
  questionIds: Question[]; // ! naming error: actually it is quest content list
  lastStatusChangeTime: string;
  status: TestStatus;
  developerId: string; // mongoDB unique id
  isPublished: boolean;
}

export interface markedResult {
  type: string;
  percentage: string;
  questionNumber: number;
}
