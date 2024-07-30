"use client";

import { useEffect, useState } from 'react';
import { useSnackbar } from "@/context/SnackbarContext";
import { fetchTestList } from '@/utils/http';
import { TestData } from '@/interface/test-list-interface';
import { QuestionData } from '@/interface/question-list-interface';
import { useUserContext } from "@/context/UserContext";
import Button from '@mui/material/Button';
import LoopIcon from '@mui/icons-material/Loop';
import Loading from '@/components/Loading';

import TestList from '@/components/marker/dashboard/TestList';
import QuestionList from '@/components/marker/dashboard/QuestionList';
import AnswerList from '@/components/marker/dashboard/AnswerList';

//main function component for the dashboard page
const dashboardPage = () => {
    const { userId } = useUserContext();
    const { showSnackbar } = useSnackbar();
    const [testData, setTestData] = useState<TestData []>([]);
    const [selectedTest, setSelectedTest] = useState<TestData | undefined>(undefined);
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionData | undefined>(undefined);
    const [loading, setLoading] = useState<Boolean>(false);

    async function loadData(snack: Boolean) {
        try{
            setLoading(true);
            
            const testList = await fetchTestList(userId);
            if (testList && testList.length > 0) {
                setTestData(testList);
                setSelectedTest(testList[0]);
                setSelectedQuestion(testList[0].questions[0]);
            }

            snack && showSnackbar("Test List Refreshed successfully!", "success");
            setLoading(false);
        }catch(error) {
            // showSnackbar("Test List Fetch error", "error");
        }
    };

    //useEffect hook to fetch user data on component
    useEffect(() => {
        loadData(false);
    }, []);

    return (
        <div className="flex flex-1 mt-4">
            <aside className="flex w-80 p-8 theme-content-bg">
                {
                    !loading ?
                    (
                        <div className='flex flex-col h-full w-full justify-between items-center'>
                            <div className='py-3 px-[4rem] bg-[#e48956] font-bold text-xl rounded-md'>
                                <span>TO DO</span>
                            </div>
                            <TestList tests={testData} setSelectedTest={setSelectedTest} />
                            <div>
                                <Button variant="outlined" className='border-black text-black hover:border-black' onClick={ () => loadData(true) }>
                                    <LoopIcon />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    ) :
                    (
                        <div className='flex flex-1 justify-center items-center'>
                            <Loading />
                        </div>
                    )
                }
            </aside>
            <main className="flex flex-1 theme-content-bg ml-4 p-8">
                {
                    !loading ?
                    (
                        <AnswerList question={selectedQuestion} />
                    ) :
                    (
                        <div className='flex flex-1 justify-center items-center'>
                            <Loading />
                        </div>
                    )
                }
            </main>
            <div className='flex theme-content-bg w-80 ml-4 p-8'>
                {
                    !loading ? 
                    (
                        <QuestionList selectedTest={selectedTest} setSelectedQuestion={setSelectedQuestion}/>
                    ) : 
                    (
                        <div className='flex flex-1 justify-center items-center'>
                            <Loading />
                        </div>
                    )
                }
            </div>
        </div>
    )
};

export default dashboardPage;