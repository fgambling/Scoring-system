"use client";
import React, { useState, useEffect } from "react";
import {
  useForm,
  UseFormRegister,
  FieldValues,
  FieldErrors,
} from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  TextField,
  Button,
  Container,
  Grid,
  Box,
  InputLabel,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

//internal import
import { loginRequest } from "@/utils/http";
import InputField from "./InputField";
import loginSvg from "../../public/assets/login.svg";
import bg1 from "../../public/assets/bg1.svg";
import bg2 from "../../public/assets/bg2.svg";
import bg3 from "../../public/assets/bg3.svg";

const Login = () => {
  // hooks -------------------------------------------------------------------
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false); // Set password visibility
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  // handlers ----------------------------------------------------------------
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      router.push(`/auth`);
    }
  }, []);

  const handleSubmitForm = async (data: any) => {
    const { username, password } = data;

    // If there are no errors, proceed with the login request
    if (username && password) {
      try {
        const response = await loginRequest(username, password);
        const token = response.data.data.access_token;

        if (token != "") {
          localStorage.setItem("accessToken", token);
          router.push(`/auth`);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError("username", {
            message: "Username or Email address does not exist",
          });
          setError("password", { message: "Incorrect password" });
        }
      }
    }
  };

  const LoginForm = ({
    register,
    handleSubmit,
    handleSubmitForm,
    errors,
    passwordVisible,
    setPasswordVisible,
  }: {
    register: UseFormRegister<FieldValues>;
    handleSubmit: any;
    handleSubmitForm: any;
    errors: FieldErrors<FieldValues>;
    passwordVisible: boolean;
    setPasswordVisible: React.Dispatch<React.SetStateAction<boolean>>;
  }) => (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className="flex flex-col items-center w-full"
    >
      <Grid container spacing={2} className="flex flex-col gap-4 w-full">
        <InputField
          id="username"
          label="Username"
          register={register}
          errors={errors}
        />
        <InputField
          id="password"
          label="Password"
          type={passwordVisible ? "text" : "password"}
          register={register}
          errors={errors}
          endAdornment={
            <Button
              onClick={() => setPasswordVisible(!passwordVisible)}
              style={{ color: "#5E486D" }}
            >
              {passwordVisible ? <VisibilityOff /> : <Visibility />}
            </Button>
          }
        />
        <Grid item xs={12}>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            fullWidth
            className="justify-center items-center px-16 py-2.5 mt-12 w-full text-2xl text-white whitespace-nowrap bg-[#5E486D]"
          >
            Login
          </Button>
        </Grid>
      </Grid>
    </form>
  );

  // jsx ---------------------------------------------------------------------
  return (
    <div className="bg-pink-50 min-h-screen flex justify-center items-center relative">
      <Container maxWidth="sm" sx={{ transform: "scale(0.7)" }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12}>
            <Box sx={{ position: "relative", left: "-100px", top: "-100px" }}>
              <Image src={loginSvg} alt="login" />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <LoginForm
              register={register}
              handleSubmit={handleSubmit}
              handleSubmitForm={handleSubmitForm}
              errors={errors}
              passwordVisible={passwordVisible}
              setPasswordVisible={setPasswordVisible}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Background images */}
      <Box
        sx={{
          position: "absolute",
          top: -75,
          right: -95,
          width: "1/3",
          transform: "scale(0.7)",
        }}
      >
        <Image src={bg1} alt="bg1" />
      </Box>
      <Box
        sx={{
          position: "absolute",
          insetY: "0",
          left: -55,
          width: "1/3",
          display: "flex",
          justifyContent: "center",
          transform: "scale(0.7)",
        }}
      >
        <Image src={bg2} alt="bg2" />
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: -75,
          right: -95,
          width: "1/3",
          transform: "scale(0.7)",
        }}
      >
        <Image src={bg3} alt="bg3" />
      </Box>
    </div>
  );
};

export default Login;
