import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import { AnswerData } from '@/interface/answer-list-interface';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import { Select, MenuItem, SelectChangeEvent } from '@mui/material';

const MarkAnswer: React.FC<{answer: AnswerData}> = ({answer}) => {
    const [score, setScore] = useState('');  // Ensure this is initialized to a string if you are not expecting nulls.

    const handleScoreChange = (event: SelectChangeEvent<string>) => {
        setScore(event.target.value);
    };

    return (
        <React.Fragment>
            <div>
                <h1 className='flex uppercase justify-center pt-4 underline underline-offset-4'>Scoring Edition</h1>
                <div className='flex justify-center items-center mt-4'>
                    <InputLabel required={true} sx={{ marginRight: '2rem', fontSize: '12px' }} className='w-[3rem]'>Answer</InputLabel>
                    <TextField
                        id="answer"
                        name="answer"
                        type="text"
                        value={answer.answer_value}
                        sx={{ width: '75%' }}
                    />
                </div>
                <div className='flex justify-center items-center mt-4'>
                    <InputLabel required={true} sx={{ marginRight: '2rem', fontSize: '12px' }} className='w-[3rem]'>Score</InputLabel>
                    <Box sx={{ width: '75%' }}>
                        <FormControl fullWidth>
                            <InputLabel id="Score">Score</InputLabel>
                            <Select
                                labelId="Score"
                                id="score"
                                name='score'
                                value={score}
                                label="Score"
                                onChange={handleScoreChange}
                            >
                                <MenuItem value="0">0 - No transcript for this item</MenuItem>
                                <MenuItem value="1">1 - Transcript for this item is nearly all incorrect</MenuItem>
                                <MenuItem value="2">2 - Most of the transcript for this item is correct</MenuItem>
                                <MenuItem value="3">3 - The transcript for this item is correct</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </div>
                <TextField
                    id="type"
                    name="type"
                    type="text"
                    value={'mark'}
                    sx={{ display: 'none' }}
                />
                <TextField
                    id="answer_id"
                    name="answer_id"
                    type="text"
                    value={answer.answer_id}
                    sx={{ display: 'none' }}
                />
            </div>
        </React.Fragment>
    );
};

export default MarkAnswer;
