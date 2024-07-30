import React from 'react';
import TextField from '@mui/material/TextField';
import { UserData } from '@/interface/user-interface';

//switch active and disable
const DisableAccount: React.FC<{user: UserData}> = ({user}) => {
    const status = React.useMemo(() => {
        return user.status === 'Active' ? 'Disable' : 'Active';
    }, [user.status]);

    return (
        <React.Fragment>
            <h1 className='flex uppercase justify-center pt-4 underline underline-offset-4'>Switch Status</h1>
            <div className='flex justify-center mt-4'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6">
                  <path d="M406.5 399.6C387.4 352.9 341.5 320 288 320H224c-53.5 0-99.4 32.9-118.5 79.6C69.9 362.2 48 311.7 48 256C48 141.1 141.1 48 256 48s208 93.1 208 208c0 55.7-21.9 106.2-57.5 143.6zm-40.1 32.7C334.4 452.4 296.6 464 256 464s-78.4-11.6-110.5-31.7c7.3-36.7 39.7-64.3 78.5-64.3h64c38.8 0 71.2 27.6 78.5 64.3zM256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-272a40 40 0 1 1 0-80 40 40 0 1 1 0 80zm-88-40a88 88 0 1 0 176 0 88 88 0 1 0 -176 0z"/>
                </svg>
                <span className='ml-4'>{user.username}</span>
            </div>
            <h1 className='uppercase text-center mt-4'>Are you sure you want to <span className="text-rose-600">{status === 'Active' ? 'Re-Active' : status}</span> this account?</h1>
             
             {/* Hidden fields to hold data that may be needed for form submission */}

            <TextField
                id="username"
                name="username"
                type="text"
                value={user.username}
                sx={{
                    display: 'none'
                }}
              />
            <TextField
                id="type"
                name="type"
                type="text"
                value={'Disable'}
                sx={{
                    display: 'none'
                }}
              />
            <TextField
                id="status"
                name="status"
                type="text"
                value={status}
                sx={{
                    display: 'none'
                }}
              />
        </React.Fragment>
    );
};

export default DisableAccount;