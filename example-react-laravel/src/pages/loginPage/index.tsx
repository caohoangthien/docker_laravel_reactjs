import React from "react";
import { Box, Button, TextField } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosInstance from "../../utils/axiosInstance";
import { setAccessToken, setRefreshToken } from "../../utils/authService";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  title: {
    textAlign: "center",
  },
  form: {
    width: 500,
    margin: "0 auto",
  },
  formGroup: {
    display: "flex",
    columnGap: 15,
    width: "100%",
    alignItems: "center",
  },
  formTextField: {
    width: "100%",
  },
  formLabel: {
    minWidth: 80,
  },
});

interface IFormValues {
  email: string;
  password: string;
}

const defaultFormValues: IFormValues = {
  email: "",
  password: "",
};

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Invalid email address" }),
  password: z.string().min(1, "Password is required"),
});

const LoginPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<IFormValues>({
    defaultValues: defaultFormValues,
    resolver: zodResolver(formSchema),
  });

  const onValid = async (values: IFormValues) => {
    try {
      const response = await axiosInstance.post("/login", values);
      if (response.status === 200) {
        const { access_token, refresh_token } = response.data;
        setAccessToken(access_token);
        setRefreshToken(refresh_token);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box>
      <h1 className={classes.title}>Login</h1>
      <form className={classes.form} onSubmit={handleSubmit(onValid)}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            rowGap: "20px",
          }}
        >
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextField
                {...field}
                className={classes.formTextField}
                label="Email"
                error={!!formErrors.email}
                helperText={formErrors.email?.message || ""}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <TextField
                {...field}
                className={classes.formTextField}
                label="Password"
                type="password"
                error={!!formErrors.password}
                helperText={formErrors.password?.message || ""}
              />
            )}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              rowGap: "15px",
            }}
          >
            <Button type="submit" variant="outlined" sx={{ height: 40 }}>
              Login
            </Button>
            <Button sx={{ height: 40 }}>Register</Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default LoginPage;
