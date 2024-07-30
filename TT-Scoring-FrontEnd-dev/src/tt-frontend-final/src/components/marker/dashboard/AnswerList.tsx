import React, { useEffect } from 'react';
import { QuestionData } from '@/interface/question-list-interface';
import { useModal } from '@/context//ModalContext';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import Button from '@mui/material/Button';
import MarkAnswer from '@/components/marker/popups/MarkAnswer';

const AnswerList: React.FC<{question: QuestionData | undefined}> = ({question}) => {
    const { toggle } = useModal();

    const [answers, setAnswers] = React.useState(question?.answers ?? []);

    useEffect(() => {
        setAnswers(question?.answers ?? []);
    });

    const removeCompletedAnswer = (index: number) => {
        const newAnswers = [...answers];
        newAnswers.splice(index, 1);
        setAnswers(newAnswers);
    };

    return (
        <div className='flex flex-1 flex-col'>
            <div className='border border-black bg-white p-2 rounded-md '>
                <span>Question: {question?.question_title}</span>
            </div>
            <ul className='border border-black my-4 flex-1 overflow-auto p-4 rounded-md'>
                {
                    answers.length !== 0 ?
                    answers.map((answer, index) => (
                        <li key={answer.answer_id} className='flex my-2 items-center p-2'>
                            <div className='border border-black bg-white p-2 rounded-md w-4/5'>
                                <span>A{index + 1}: {answer.answer_value}</span>
                            </div>
                            <AssignmentTurnedInOutlinedIcon className='ml-auto cursor-pointer' onClick={() => toggle(<MarkAnswer answer={answer} />, () => removeCompletedAnswer(index))} />
                        </li>
                    )) :
                    <div className='flex h-full'>
                        <span className='m-auto'>No Flagged Answer need to be marked!</span>
                    </div>
                }
            </ul>
            {/* <Button variant="outlined" className='border-black text-black hover:border-black w-1/5 mx-auto'>Save</Button> */}
        </div>
    );
};

export default AnswerList;