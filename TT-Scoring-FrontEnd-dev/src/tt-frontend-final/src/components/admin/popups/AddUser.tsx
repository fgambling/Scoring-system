import React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import '../../../../public/assets/css/modal.css';
//define the adduser component using React 
const AddUser: React.FC = () => {
  const [roles, setRoles] = React.useState<string []>([]);

  //handles changing the user role from dropdown, update state
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setRoles(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <React.Fragment>
        <div className='flex justify-center mt-4'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6">
            <path d="M406.5 399.6C387.4 352.9 341.5 320 288 320H224c-53.5 0-99.4 32.9-118.5 79.6C69.9 362.2 48 311.7 48 256C48 141.1 141.1 48 256 48s208 93.1 208 208c0 55.7-21.9 106.2-57.5 143.6zm-40.1 32.7C334.4 452.4 296.6 464 256 464s-78.4-11.6-110.5-31.7c7.3-36.7 39.7-64.3 78.5-64.3h64c38.8 0 71.2 27.6 78.5 64.3zM256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-272a40 40 0 1 1 0-80 40 40 0 1 1 0 80zm-88-40a88 88 0 1 0 176 0 88 88 0 1 0 -176 0z"/>
          </svg>
          {/* Title of the component */}
          <h1 className='flex uppercase justify-center ml-4 underline underline-offset-4'>Add User</h1>
        </div>
        {/* Main content area for input fields */}
        <div className='inputs-content'>
            <div className='flex single-input items-center'>
              <InputLabel required={true} sx={{ flex: 1, fontSize: '12px' }}>Name</InputLabel>
              <Box sx={{ width: '75%' }}>
                {/* Text field for entering the name */}
                <TextField
                  autoFocus 
                  required 
                  margin="dense"
                  id="username"
                  name="username"
                  type="text"
                  label="Name"
                  variant="outlined"
                  fullWidth
                  sx={{ flex: 3 }}
                />
              </Box>
            </div>
            {/* Input field container for the Role */}
            <div className='flex single-input items-center'>
              <InputLabel required={true} sx={{ flex: 1, fontSize: '12px' }}>Role</InputLabel>
              <Box sx={{ width: '75%' }}>
                <FormControl fullWidth>
                  <InputLabel id="Role">Role*</InputLabel>
                  <Select
                    labelId="role"
                    id="roles"
                    name='roles'
                    multiple
                    value={roles}
                    label="Role"
                    onChange={handleChange} 
                  >
                    {/* Options for the role */}
                    <MenuItem value={"admin"}>Admin</MenuItem>
                    <MenuItem value={"test developer"}>Test Develop</MenuItem>
                    <MenuItem value={"marker"}>Marker</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </div>
            {/* Single input field container for the Email */}
            <div className='flex single-input items-center'>
              <InputLabel required={true} sx={{ flex: 1, fontSize: '12px' }}>Email</InputLabel>
              <Box sx={{ width: '75%' }}>
                {/* Text field for entering the email */}
                <TextField
                    required 
                    margin="dense"
                    id="email"
                    name="email"
                    type="email" 
                    label="Email"
                    fullWidth
                    sx={{ flex: 3 }}
                />
              </Box>
            </div>
            {/* Single input field container for the Password */}
            <div className='flex single-input items-center'>
              <InputLabel required={true} sx={{ flex: 1, fontSize: '12px' }}>Password</InputLabel>
              <Box sx={{ width: '75%' }}>
                {/* Text field for entering the password */}
                <TextField
                    required 
                    margin="dense"
                    id="password"
                    name="password"
                    type="password" 
                    label="Password"
                    fullWidth
                    sx={{ flex: 3 }}
                />
              </Box>
            </div>
            {/* Hidden field to store the type of the operation */}
            <TextField
                id="type"
                name="type"
                type="text"
                value={'Add'}
                sx={{ display: 'none' }} // Hide this field from view
              />
        </div>
    </React.Fragment>
  );
}

export default AddUser;