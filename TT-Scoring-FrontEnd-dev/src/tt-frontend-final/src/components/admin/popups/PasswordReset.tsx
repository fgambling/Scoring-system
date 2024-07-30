import React from 'react';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import { UserData } from '@/interface/user-interface';
import '../../../../public/assets/css/modal.css';

//passwordreset component
const PasswordReset: React.FC<{user: UserData}> = ({ user }) => (
    <React.Fragment>
        <h1 className='flex uppercase justify-center pt-4 underline underline-offset-4'>Password Reset</h1>
        <div className='flex justify-center mt-4'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6">
            <path d="M406.5 399.6C387.4 352.9 341.5 320 288 320H224c-53.5 0-99.4 32.9-118.5 79.6C69.9 362.2 48 311.7 48 256C48 141.1 141.1 48 256 48s208 93.1 208 208c0 55.7-21.9 106.2-57.5 143.6zm-40.1 32.7C334.4 452.4 296.6 464 256 464s-78.4-11.6-110.5-31.7c7.3-36.7 39.7-64.3 78.5-64.3h64c38.8 0 71.2 27.6 78.5 64.3zM256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-272a40 40 0 1 1 0-80 40 40 0 1 1 0 80zm-88-40a88 88 0 1 0 176 0 88 88 0 1 0 -176 0z"/>
          </svg>
          <span className='ml-4'>{user.username}</span>
        </div>
        <div className='inputs-content'>
            {/* Input for the new password */}
            <div className='flex single-input items-center'>
              <InputLabel required={true} sx={{
                flex: 1,
                fontSize: '12px'
              }}>NEW PASSWORD</InputLabel>
              <TextField
                autoFocus
                required
                margin="dense"
                id="password"
                name="password"
                type="password"
                fullWidth
                sx={{
                  flex: 3
                }}
              />
            </div>
            {/* Input for confirming the new password */}
            <div className='flex single-input items-center'>
              <InputLabel required={true} sx={{
                flex: 1,
                fontSize: '12px'
              }}>ENTER AGAIN</InputLabel>
              <TextField
                  required
                  margin="dense"
                  id="re_password"
                  name="re_password"
                  type="password"
                  fullWidth
                  sx={{
                    flex: 3
                  }}
              />
            </div>
            {/* Optional input for additional information */}
            {/* <div className='flex single-input items-center'>
              <InputLabel sx={{
                flex: 1,
                fontSize: '12px'
              }}>PROMPT INFO</InputLabel>
              <TextField
                  margin="dense"
                  id="info"
                  name="info"
                  type="text"
                  fullWidth
                  sx={{
                    flex: 3
                  }}
              />
            </div> */}
            {/* Hidden field holding the username, not displayed but used for form submission */}
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
                value={'Reset'}
                sx={{
                    display: 'none'
                }}
              />
        </div>
    </React.Fragment>
);

export default PasswordReset;