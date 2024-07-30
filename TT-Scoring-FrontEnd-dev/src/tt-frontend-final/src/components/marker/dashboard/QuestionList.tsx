import React from 'react';
import { QuestionData } from '@/interface/question-list-interface';
import { TestData } from '@/interface/test-list-interface';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { exportFile } from "@/utils/http";

const QuestionList: React.FC<{selectedTest: TestData | undefined, setSelectedQuestion: Function}> = ({selectedTest, setSelectedQuestion}) => {
    const [questions, _] = React.useState<QuestionData []>(selectedTest?.questions ?? []);
    const [questionNames, setQuestionNames] = React.useState<{ [key: string]: string }>(questions.reduce((acc, question) => ({ ...acc, [question.question_id]: question.question_title }), {}));
    const inputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({});

    React.useEffect(() => {
      setQuestionNames(
        questions.reduce((acc, question) => ({ ...acc, [question.question_id]: question.question_title }), {})
      );

      setSelectedQuestion(questions[0]);
    }, [questions]);

    const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
        <Tooltip {...props} classes={{ popper: className }} />
      ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
          backgroundColor: '#f5f5f9',
          color: 'rgba(0, 0, 0, 0.87)',
          maxWidth: 220,
          fontSize: theme.typography.pxToRem(12),
          border: '1px solid #dadde9',
        },
      }));

      const handleInputChange = (id: string, value: string) => {
        setQuestionNames(prev => ({ ...prev, [id]: value }));
      };
  
      const rename = (id: string) => {
        const currentInput = inputRefs.current[id];
        if (currentInput) {
          currentInput.readOnly = false;
          currentInput.focus();
        }
      };
  
      const questionSelection = (question: QuestionData) => {
        const currentInput = inputRefs.current[question.question_id];
        if (currentInput) currentInput.readOnly = true;

        setSelectedQuestion(question);

        console.log(question);
      };
  
      const updateTestName = () => {
        // TODO: API for updating user name
        console.log('Updated question name!');
      };

    return (
        <div className='flex flex-col w-full'>
            <ul className='border border-black rounded-md w-full flex-1 p-4 overflow-auto mb-4'>
                {
                    questions.length !== 0 ?
                    questions.map(question => (
                        <li key={question.question_id} className='flex my-2 items-center'>
                            {/* <input 
                            type="text" 
                            readOnly
                            value={questionNames[question.question_id]} 
                            ref={el => inputRefs.current[question.question_id] = el} 
                            className='w-3/5 border border-black rounded-md py-2 px-4 cursor-pointer bg-inherit test' 
                            onClick={() => questionSelection(question)}
                            onChange={(e) => handleInputChange(question.question_id, e.target.value)}
                            onBlur={() => updateTestName()}
                            /> */}
                            <span className='w-3/5 border border-black rounded-md py-2 px-4 cursor-pointer bg-inherit test' onClick={() => questionSelection(question)}>{ questionNames[question.question_id] }</span>
                            {/* <DriveFileRenameOutlineOutlinedIcon className='cursor-pointer mx-1 ml-auto' onClick={() => rename(question.question_id)}/> */}
                            <HtmlTooltip
                              title={
                                <React.Fragment>
                                  {"Created by:" + 'develop'} <br />
                                  {"Created time: " + '10/05/2024'} <br />
                                  {"Last edit by: " + 'marker'} <br />
                                  {"Last edit time: " + '17/05/2024'}
                                </React.Fragment>
                              }
                            >
                              <InfoOutlinedIcon className='cursor-pointer mx-1 ml-auto'/>
                            </HtmlTooltip>
                        </li>
                    )) :
                    <div className='flex h-full'>
                      <span className='m-auto'>No question selected!</span>
                    </div>
                }
            </ul>
            {/* <div className='flex justify-around mt-4'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-[20px]">
                <path d="M48 96V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V170.5c0-4.2-1.7-8.3-4.7-11.3l33.9-33.9c12 12 18.7 28.3 18.7 45.3V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H309.5c17 0 33.3 6.7 45.3 18.7l74.5 74.5-33.9 33.9L320.8 84.7c-.3-.3-.5-.5-.8-.8V184c0 13.3-10.7 24-24 24H104c-13.3 0-24-10.7-24-24V80H64c-8.8 0-16 7.2-16 16zm80-16v80H272V80H128zm32 240a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="w-[15px] cursor-pointer" onClick={() => exportFile(selectedTest.test_id)}>
                <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 232V334.1l31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31V232c0-13.3 10.7-24 24-24s24 10.7 24 24z"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-[17px]">
                <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/>
              </svg>
            </div> */}
        </div>
    );
};

export default QuestionList;