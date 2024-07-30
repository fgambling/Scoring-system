import { AnswerData } from '@/interface/answer-list-interface';

export interface QuestionData {
    question_id: string,
    question_title: string,
    created_by: string,
    created_time: string,
    last_edit_by: string,
    last_edit_time: string,
    answers: AnswerData []
}