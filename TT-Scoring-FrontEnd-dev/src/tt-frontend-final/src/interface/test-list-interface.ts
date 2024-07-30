import { QuestionData } from '@/interface/question-list-interface';

export interface TestData {
    test_id: string,
    test_name: string,
    created_by: string,
    created_time: string,
    last_edit_by: string,
    last_edit_time: string,
    questions: QuestionData []
}