// InputField.js
import React from 'react';
import { Grid, InputLabel, TextField } from "@mui/material";
import { UseFormRegister, FieldValues, FieldErrors } from "react-hook-form";

export const InputField = ({
  id,
  label,
  register,
  errors,
  type = "text",
  endAdornment,
}: {
  id: string;
  label: string;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
  type?: string;
  endAdornment?: React.ReactNode;
}) => (
  <div className="flex items-center">
    <Grid container alignItems="flex-end">
      <Grid item xs={12} className="flex items-center border-b-2 border-[#5E486D]">
        <InputLabel
          htmlFor={id}
          className="text-2xl text-[#999999] flex-1"
          style={{ minWidth: '200px' }}
        >
          {label}
        </InputLabel>
        <TextField
          variant="standard"
          id={id}
          type={type}
          fullWidth
          {...register(id, { required: 'This field is required' })}
          InputProps={{
            className: "text-2xl bg-transparent outline-none border-b-0",
            disableUnderline: true,
            style: { height: '60px' },
            endAdornment: endAdornment,
          }}
          error={Boolean(errors[id])}
        />
      </Grid>
      {errors[id] && (
        <Grid item xs={12} className="text-red-500">
          {errors[id]?.message?.toString()}
        </Grid>
      )}
    </Grid>
  </div>
);

export default InputField;
