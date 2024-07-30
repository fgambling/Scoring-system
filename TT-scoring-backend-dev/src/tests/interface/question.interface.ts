export interface Question {
  _id: string;
  title: string;
  keys: AlternativeKey[];
  ratingScale: Map<string, string>;
  testId: string;
}
export interface AlternativeKey {
  key: string;
  alternativeKeys?: Map<string, string[]>;
}
