import React from 'react';
import { TestData } from '@/interface/test-list-interface';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const TestList: React.FC<{tests: TestData [], setSelectedTest: Function}> = ({tests, setSelectedTest}) => {
  const [testNames, setTestNames] = React.useState<{ [key: string]: string }>(tests.reduce((acc, test) => ({ ...acc, [test.test_id]: test.test_name }), {}));
  const inputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({});

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
      setTestNames(prev => ({ ...prev, [id]: value }));
    };

    const rename = (id: string) => {
      const currentInput = inputRefs.current[id];
      if (currentInput) {
        currentInput.readOnly = false;
        currentInput.focus();
      }
    };

    const testSelection = (test: TestData) => {
      const currentInput = inputRefs.current[test.test_id];
      if (currentInput) currentInput.readOnly = true;

      setSelectedTest(test);
    };

    const updateTestName = (test: TestData) => {
      const currentInput = inputRefs.current[test.test_id];
      if (currentInput) {
        if(!currentInput.readOnly) {
          // TODO: API for updating user name
          console.log('Updated test name!');
        }
      }
    };

    return (
        <div className='border border-black rounded-md w-full flex-1 p-4 my-4 overflow-auto'>
            <ul className='h-full'>
                {
                    tests.length !== 0 ?
                    tests.map(test => (
                        <li key={test.test_id} className='flex my-2 items-center'>
                            {/* <input 
                            type="text" 
                            readOnly
                            value={testNames[test.test_id]} 
                            ref={el => inputRefs.current[test.test_id] = el} 
                            className='w-3/5 border border-black rounded-md py-2 px-4 cursor-pointer bg-inherit' 
                            onClick={() => testSelection(test)}
                            onChange={(e) => handleInputChange(test.test_id, e.target.value)}
                            onBlur={() => updateTestName(test)}
                            /> */}
                            <span className='w-4/5 border border-black rounded-md py-2 px-4 cursor-pointer bg-inherit' onClick={() => testSelection(test)}>{ testNames[test.test_id] }</span>
                            {/* <DriveFileRenameOutlineOutlinedIcon className='cursor-pointer mx-1 ml-auto' onClick={() => rename(test.test_id)}/> */}
                            <HtmlTooltip
                              title={
                                <React.Fragment>
                                  {"Created by:" + 'develop'} <br />
                                  {"Created time: " + '10/05/2024'} <br />
                                  {"Last edit by: " + 'marker'} <br />
                                  {"Last edit time: " + '15/05/2024'}
                                </React.Fragment>
                              }
                            >
                              <InfoOutlinedIcon className='cursor-pointer mx-1 ml-auto'/>
                            </HtmlTooltip>
                        </li>
                    )) :
                    <div className='flex h-full'>
                      <span className='m-auto'>No Test had been signed!</span>
                    </div>
                }
            </ul>
        </div>
    );
};

export default TestList;